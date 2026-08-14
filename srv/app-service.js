const cds = require("@sap/cds");

const LOG = cds.log("app-service");

const EMAIL_CONTATO_DEV = "Thor.boantti@test.com.br";
const TYPE_CODE_DESCRICAO = "10004";
const STATUS_INICIAL_CHAMADO = "Z6";

// SUPOSICAO a confirmar no tenant: "2" = documento/arquivo anexado (o "3" seria link, usado
// com DocumentLink). O valor NAO esta no ticket.edmx - a
// ServiceRequestAttachmentFolderCategoryCodeCollection e um code list generico Code/Description
// resolvido so em runtime. Se o C4C recusar o anexo reclamando do campo, o code certo sai de um
// GET nessa colecao no tenant.
const CATEGORY_CODE_ANEXO_ARQUIVO = "2";

// O CAP repassa ao C4C QUALQUER campo que o cliente mandar, inclusive os nao-criaveis
// (ObjectID, UUID, ETag): @sap.creatable e so descritivo no modelo importado. A lista abaixo
// documenta o contrato do POST e evita um 400 vindo do C4C por campo que o app nunca deveria
// ter enviado.
const CAMPOS_CRIAVEIS_ANEXO = [
    "ParentObjectID",
    "ServiceRequestID",
    "TypeCode",
    "MimeType",
    "Binary",
    "DocumentLink",
    "Name",
    "CategoryCode"
];

// MimeType vazio no C4C nao pode virar download sem tipo: o browser abriria o arquivo como
// texto. So a function usa o default - o CREATE continua OMITINDO MimeType vazio, porque ali
// quem deduz pela extensao e o C4C.
const MIME_TYPE_PADRAO_ANEXO = "application/octet-stream";

const LIMITE_COMPONENTES_SAP = 200;

function escaparHtml(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function linhasDaResposta(resposta) {
    if (Array.isArray(resposta)) return resposta;
    if (!resposta || typeof resposta !== "object") return [];

    const corpo = resposta.d !== undefined ? resposta.d : resposta;
    if (Array.isArray(corpo)) return corpo;
    if (!corpo || typeof corpo !== "object") return [];

    const lista = corpo.results || corpo.value;
    if (Array.isArray(lista)) return lista;

    return Object.keys(corpo).length ? [corpo] : [];
}

// Blindagem de shape: com kind "odata-v2" o cliente remoto do CAP ja desembrulha o envelope
// {d:{results:[...]}} do C4C, entao linhasDaResposta normalmente so repassa o array. Ela cobre o
// caso de a resposta chegar crua (kind diferente, mock ou erro de negociacao) e normaliza a
// leitura de UM registro, que o dispatch precisa receber como objeto ou null - nunca undefined.
const lerAchatado = (servico) => async (req) => {
    const linhas = linhasDaResposta(await servico.run(req.query));
    return req.query.SELECT.one ? (linhas[0] ?? null) : linhas;
};

// O runtime do CAP converte toda propriedade cds.LargeBinary em stream Readable ANTES de
// chegar aqui (validate_input generico), e o conversor de payload OData V2 so sabe transformar
// Buffer em base64: sem esta normalizacao o corpo enviado ao C4C leva a string
// "[object Readable]" no lugar do arquivo e o C4C ainda responde 201 - o anexo some sem
// ninguem perceber.
async function binarioComoBuffer(valor) {
    if (valor === undefined || valor === null) return null;
    if (Buffer.isBuffer(valor)) return valor;
    if (typeof valor === "string") return Buffer.from(valor, "base64");

    if (typeof valor.on === "function") {
        const partes = [];
        for await (const parte of valor) partes.push(Buffer.from(parte));
        return Buffer.concat(partes);
    }

    return null;
}

// Segunda fonte do requisitante, usada so quando a ContactQueryByElements nao devolve contato.
// Existe porque quem trabalha na propria empresa esta cadastrado como funcionario (Employee) e
// nao como contato de cliente: sem isso o app bloqueia o proprio time na abertura da tela.
// Consulta via CQN porque o employeeanduser TEM model EDMX importado - o cliente odata-v2 monta
// $select/$filter e ja desembrulha o envelope, sem o send() cru que o accountService precisa.
// Nunca lanca: falha tecnica aqui vale como "nao achou", igual ao bloco do AccountCollection.
async function buscarFuncionarioPorEmail(servico, email) {
    try {
        const { EmployeeCollection } = servico.entities;
        const linhas = linhasDaResposta(await servico.run(
            SELECT.from(EmployeeCollection)
                .columns(
                    "EmployeeID",
                    "BusinessPartnerID",
                    "BusinessPartnerFormattedName",
                    "FirstName",
                    "LastName",
                    "Email"
                )
                .where({ Email: email })
        ));

        // Sem $top/$orderby de proposito: o mesmo e-mail pode ter mais de um registro (recontratacao,
        // dois vinculos) e a ordem que o C4C devolve nao e contratual - com $top=1 o requisitante
        // trocaria de BusinessPartnerID entre um F5 e outro. O desempate acontece aqui, por EmployeeID,
        // porque um $orderby recusado pelo C4C cairia no catch e viraria "nao achou" silencioso.
        const funcionarios = linhas.filter(Boolean);
        funcionarios.sort((a, b) =>
            String(a.EmployeeID || "").localeCompare(String(b.EmployeeID || "")));

        return funcionarios[0] || null;
    } catch (erro) {
        LOG.warn(
            `Falha ao consultar EmployeeCollection para o e-mail ${email}; ` +
            `tratando como requisitante nao encontrado: ${erro.message}`
        );
        return null;
    }
}

module.exports = cds.service.impl(async function () {
    const employeeAndUserService = await cds.connect.to("employeeanduser");
    const contactService = await cds.connect.to("contact");
    const ticketService = await cds.connect.to("ticket");
    const changedoclistService = await cds.connect.to("changedoclist");
    // Servico OData custom do tenant (service root /sap/c4c/odata/v1/c4codata, SEM o sufixo
    // "api" do kind c4c). Nao tem model EDMX importado: e consumido so via send() cru com
    // method/path, porque a unica entidade usada (AccountCollection) nao existe no c4codataapi.
    const accountService = await cds.connect.to("account");
    const interactionService = await cds.connect.to("servicerequestinteraction");

    let promessaCalmItsm;
    const conectarCalmItsm = () => {
        promessaCalmItsm ??= cds.connect.to("SAP.Cloud.ALM.ITSM").catch((erro) => {
            promessaCalmItsm = undefined;
            throw erro;
        });
        return promessaCalmItsm;
    };

    const {
        Employees,
        Contacts,
        ServiceRequests,
        ServiceRequestTexts,
        ServiceRequestAttachmentFolders,
        ChangeDocuments
    } = this.entities;

    this.on("READ", Employees, lerAchatado(employeeAndUserService));

    this.on("READ", Contacts, lerAchatado(contactService));

    this.on("READ", ServiceRequests, async (req) => {
        // O C4C rejeita contagem em ServiceRequestCollection ("'$count' is not a valid system
        // query option"), entao a query e higienizada antes de seguir para o servico remoto.
        if (req.query.SELECT?.count) {
            req.query.SELECT.count = false;
        }

        return lerAchatado(ticketService)(req);
    });

    this.on("READ", ServiceRequestTexts, lerAchatado(ticketService));

    // O C4C pode devolver o Binary de cada anexo quando a query nao manda $select (columns
    // ['*'] perde o $select em cqn2odata): a lista de anexos nao pode arrastar 13 MB por linha,
    // e o adapter V4 nao filtra propriedade extra devolvida pelo handler. Mesmo remedio do
    // CREATE. Os bytes saem SO pela function AnexoConteudo.
    this.on("READ", ServiceRequestAttachmentFolders, async (req) => {
        // Mesma pegadinha de ServiceRequestCollection: o C4C responde "'$count' is not a valid
        // system query option". A lista de anexos nunca precisa de contagem no servidor.
        if (req.query.SELECT?.count) {
            req.query.SELECT.count = false;
        }

        const lidos = await lerAchatado(ticketService)(req);

        for (const linha of Array.isArray(lidos) ? lidos : [lidos].filter(Boolean)) {
            delete linha.Binary;
        }

        return lidos;
    });

    this.on("READ", ChangeDocuments, lerAchatado(changedoclistService));

    this.on("CREATE", ServiceRequests, async (req) => {
        const notas = Array.isArray(req.data.ServiceRequestTextCollection)
            ? req.data.ServiceRequestTextCollection
            : [];
        const notasValidas = notas
            .filter((nota) => nota && String(nota.Text || "").trim())
            .map((nota) => ({
                TypeCode: nota.TypeCode || TYPE_CODE_DESCRICAO,
                Text: nota.Text,
                FormattedText: nota.FormattedText || escaparHtml(nota.Text)
            }));

        if (!req.data.ServiceRequestUserLifeCycleStatusCode) {
            req.data.ServiceRequestUserLifeCycleStatusCode = STATUS_INICIAL_CHAMADO;
        }

        if (!req.data.ID) {
            const { ServiceRequestCollection } = ticketService.entities;
            let linhasMax;
            try {
                const [porId, porCriacao] = await Promise.all([
                    ticketService.run(
                        SELECT.from(ServiceRequestCollection).columns("ID").orderBy("ID desc").limit(10)
                    ),
                    ticketService.run(
                        SELECT.from(ServiceRequestCollection).columns("ID").orderBy("CreationDateTime desc").limit(10)
                    )
                ]);
                linhasMax = [...linhasDaResposta(porId), ...linhasDaResposta(porCriacao)];
            } catch (erro) {
                return req.reject(
                    erro.statusCode || 502,
                    `Falha ao determinar o proximo numero do chamado: ${erro.message}`
                );
            }

            if (!linhasMax.length) {
                req.data.ID = "1";
            } else {
                const numeros = linhasMax
                    .map((linha) => parseInt(linha && linha.ID, 10))
                    .filter((numero) => !Number.isNaN(numero));

                if (!numeros.length) {
                    return req.reject(
                        502,
                        "Nenhum ID de chamado numerico encontrado no C4C: " +
                            "nao e possivel gerar o proximo numero sequencial."
                    );
                }
                req.data.ID = String(Math.max(...numeros) + 1);
            }
        }

        if (notasValidas.length) {
            req.data.ServiceRequestTextCollection = notasValidas;
        } else {
            delete req.data.ServiceRequestTextCollection;
        }

        let resultado;
        try {
            resultado = await ticketService.run(req.query);
        } catch (erro) {
            return req.reject(
                erro.statusCode || 502,
                `Falha ao criar o chamado no C4C: ${erro.message}`
            );
        }

        const criado = linhasDaResposta(resultado)[0] || {};
        const resposta = {};
        for (const [campo, valor] of Object.entries(criado)) {
            if (valor === null || typeof valor !== "object") resposta[campo] = valor;
        }
        return resposta;
    });

    this.on("CREATE", ServiceRequestAttachmentFolders, async (req) => {
        const parentObjectID = String(req.data.ParentObjectID || "").trim();
        const nome = String(req.data.Name || "").trim();

        const binario = await binarioComoBuffer(req.data.Binary);

        // A normalizacao vem ANTES da validacao de proposito: um stream e sempre truthy, mesmo
        // criado a partir de conteudo vazio, entao so com o Buffer na mao da para reprovar um
        // arquivo de 0 byte em vez de manda-lo vazio para o C4C.
        if (binario && binario.length) {
            req.data.Binary = binario;
        } else {
            delete req.data.Binary;
        }

        for (const campo of Object.keys(req.data)) {
            if (!CAMPOS_CRIAVEIS_ANEXO.includes(campo)) delete req.data[campo];
        }

        if (!parentObjectID) {
            return req.reject(400, "ParentObjectID e obrigatorio: e o ObjectID do chamado que recebe o anexo.");
        }
        if (!nome) {
            return req.reject(400, "Name e obrigatorio: e o nome do arquivo anexado.");
        }
        if (!req.data.Binary && !req.data.DocumentLink) {
            return req.reject(400, "Informe Binary (arquivo) ou DocumentLink (URL) para criar o anexo.");
        }

        req.data.ParentObjectID = parentObjectID;
        req.data.Name = nome;

        // CategoryCode e Nullable=false no contrato do C4C e o CAP nao o exige (POST sem ele
        // passa): sem default aqui, a recusa viria do C4C como um 502 generico. So vale para
        // upload de arquivo - anexo por link manda o proprio code.
        if (req.data.Binary && !String(req.data.CategoryCode || "").trim()) {
            req.data.CategoryCode = CATEGORY_CODE_ANEXO_ARQUIVO;
        }

        // MimeType vazio iria como null no corpo e o C4C recusa; sem valor e melhor omitir e
        // deixar o C4C deduzir pela extensao. TypeCode nao ganha default pelo mesmo raciocinio:
        // e opcional no contrato (String(5) sem not null) e o default do C4C vale mais que um
        // chute - os codes tambem nao estao no edmx.
        if (!String(req.data.MimeType || "").trim()) {
            delete req.data.MimeType;
        }

        let resultado;
        try {
            resultado = await ticketService.run(req.query);
        } catch (erro) {
            return req.reject(
                erro.statusCode || 502,
                `Falha ao anexar o arquivo ao chamado no C4C: ${erro.message}`
            );
        }

        const criado = linhasDaResposta(resultado)[0] || {};
        const resposta = {};
        for (const [campo, valor] of Object.entries(criado)) {
            if (valor === null || typeof valor !== "object") resposta[campo] = valor;
        }

        // O C4C devolve o Binary inteiro no create; ecoar o arquivo de volta ao browser so
        // dobraria o trafego - o app so precisa do ObjectID/Name.
        delete resposta.Binary;

        return resposta;
    });

    this.on("CREATE", ServiceRequestTexts, async (req) => {
        const parentObjectID = String(req.data.ParentObjectID || "").trim();
        const typeCode = String(req.data.TypeCode || "").trim();
        const texto = String(req.data.Text || "").trim();

        if (!parentObjectID) {
            return req.reject(400, "ParentObjectID é obrigatório: é o ObjectID do chamado que recebe a mensagem.");
        }
        if (!typeCode) {
            return req.reject(400, "TypeCode é obrigatório: o tipo da mensagem (ex: 10008 para resposta do requisitante).");
        }
        if (!texto) {
            return req.reject(400, "Text é obrigatório: o conteúdo da mensagem não pode estar vazio.");
        }

        req.data.ParentObjectID = parentObjectID;
        req.data.TypeCode = typeCode;
        req.data.Text = texto;
        req.data.FormattedText = escaparHtml(texto);

        let resultado;
        try {
            resultado = await ticketService.run(req.query);
        } catch (erro) {
            return req.reject(
                erro.statusCode || 502,
                `Falha ao enviar a mensagem do chamado no C4C: ${erro.message}`
            );
        }

        const criado = linhasDaResposta(resultado)[0] || {};
        const resposta = {};
        for (const [campo, valor] of Object.entries(criado)) {
            if (valor === null || typeof valor !== "object") resposta[campo] = valor;
        }
        return resposta;
    });

    this.on("UPDATE", ServiceRequests, async (req) => {
        const status = String(req.data.ServiceRequestUserLifeCycleStatusCode || "").trim();

        if (!status) {
            return req.reject(400, "ServiceRequestUserLifeCycleStatusCode é obrigatório: deve ser '5' (concluído) ou '6' (fechado).");
        }

        if (status !== "5" && status !== "6") {
            return req.reject(400, "ServiceRequestUserLifeCycleStatusCode inválido: deve ser '5' (concluído) ou '6' (fechado).");
        }

        req.data = {
            ServiceRequestUserLifeCycleStatusCode: status
        };

        let resultado;
        try {
            resultado = await ticketService.run(req.query);
        } catch (erro) {
            return req.reject(
                erro.statusCode || 502,
                `Falha ao atualizar o status do chamado no C4C: ${erro.message}`
            );
        }

        const atualizado = linhasDaResposta(resultado)[0] || {};
        const resposta = {};
        for (const [campo, valor] of Object.entries(atualizado)) {
            if (valor === null || typeof valor !== "object") resposta[campo] = valor;
        }
        return resposta;
    });

    this.on("Requisitante", async (req) => {
        const emailInformado = (req.data.email || "").trim();
        const emailLogado = (req.user && req.user.attr && req.user.attr.email) || "";
        const email = emailInformado || emailLogado || EMAIL_CONTATO_DEV;

        let resposta;
        try {
            resposta = await contactService.send("ContactQueryByElements", { EMailURI: email });
        } catch (erro) {
            return req.reject(
                erro.statusCode || 502,
                `Falha ao consultar os clientes do contato ${email}: ${erro.message}`
            );
        }

        const linhas = linhasDaResposta(resposta);

        const primeira = linhas.find(Boolean) || {};
        const nome = String(primeira.Name || "").trim() ||
            [primeira.FirstName, primeira.LastName]
                .map((parte) => String(parte || "").trim())
                .filter(Boolean)
                .join(" ");

        const contatoId = String(primeira.ContactID == null ? "" : primeira.ContactID).trim();

        // Sem ContactID nao ha contato utilizavel (nem quando a consulta volta vazia, nem quando
        // volta linha sem o ID): antes de desistir, tenta o MESMO e-mail na EmployeeCollection.
        // Retorno antecipado porque o enriquecimento por AccountCollection abaixo so faz sentido
        // para contas de contato - funcionario nao tem AccountID, entao clientes fica vazio e
        // quem decide bloquear a tela continua sendo o frontend.
        if (!contatoId) {
            const funcionario = await buscarFuncionarioPorEmail(employeeAndUserService, email);
            if (!funcionario) return { nome: "", contatoId: "", clientes: [], origem: "" };

            const nomeFuncionario = [funcionario.FirstName, funcionario.LastName]
                .map((parte) => String(parte || "").trim())
                .filter(Boolean)
                .join(" ") ||
                String(funcionario.BusinessPartnerFormattedName || "").trim();

            // BusinessPartnerID e o identificador que o C4C aceita em BuyerMainContactPartyID;
            // o EmployeeID entra so como ultimo recurso, para nao devolver contatoId vazio
            // (vazio = frontend trata como "nao achou").
            const idFuncionario =
                String(funcionario.BusinessPartnerID == null ? "" : funcionario.BusinessPartnerID).trim() ||
                String(funcionario.EmployeeID == null ? "" : funcionario.EmployeeID).trim();

            return {
                nome: nomeFuncionario,
                contatoId: idFuncionario,
                clientes: [],
                origem: "funcionario"
            };
        }

        // Passo 1 (ContactQueryByElements) ja traz uma linha por conta do contato: o dedupe
        // por AccountID monta a lista com o AccountFormattedName como descricao provisoria.
        const porCodigo = new Map();
        for (const linha of linhas) {
            if (!linha) continue;

            const code = String(linha.AccountID == null ? "" : linha.AccountID).trim();
            if (!code) continue;

            const nome = String(linha.AccountFormattedName || "").trim();
            const existente = porCodigo.get(code);

            if (!existente) porCodigo.set(code, { code, descricao: nome || code });
            else if (existente.descricao === code && nome) existente.descricao = nome;
        }

        // Passo 2: a descricao oficial do cliente e o AccountName da AccountCollection do
        // servico "account" (c4codata). A consulta fica restrita as contas DO CONTATO (uma
        // chamada so, $filter com "or"). Falha aqui NAO derruba a function: loga warning e
        // segue com o AccountFormattedName/code do passo 1 como fallback.
        if (porCodigo.size) {
            try {
                const filtro = [...porCodigo.keys()]
                    // Literal string em OData V2: aspas simples no valor escapam dobrando.
                    .map((code) => `AccountID eq '${code.replace(/'/g, "''")}'`)
                    .join(" or ");

                // send() cru (sem model EDMX) nao passa pela negociacao do kind odata-v2:
                // o $format=json + Accept garantem JSON em vez do XML default do C4C, e o
                // envelope V2 {d:{results:[...]}} volta intacto - linhasDaResposta desembrulha.
                const contas = linhasDaResposta(await accountService.send({
                    method: "GET",
                    path: `/AccountCollection?$filter=${encodeURIComponent(filtro)}&$select=AccountID,AccountName&$format=json`,
                    headers: { Accept: "application/json" }
                }));

                for (const conta of contas) {
                    if (!conta) continue;

                    const code = String(conta.AccountID == null ? "" : conta.AccountID).trim();
                    const accountName = String(conta.AccountName || "").trim();
                    const cliente = porCodigo.get(code);

                    if (cliente && accountName) cliente.descricao = accountName;
                }
            } catch (erro) {
                LOG.warn(
                    `Falha ao consultar AccountCollection para as contas do contato ${email}; ` +
                    `mantendo a descricao da ContactQueryByElements como fallback: ${erro.message}`
                );
            }
        }

        const clientes = [...porCodigo.values()];

        const nomesRepetidos = new Set();
        const nomesVistos = new Set();
        for (const cliente of clientes) {
            if (nomesVistos.has(cliente.descricao)) nomesRepetidos.add(cliente.descricao);
            else nomesVistos.add(cliente.descricao);
        }
        for (const cliente of clientes) {
            if (nomesRepetidos.has(cliente.descricao) && cliente.descricao !== cliente.code) {
                cliente.descricao = `${cliente.descricao} (${cliente.code})`;
            }
        }

        clientes.sort((a, b) => a.descricao.localeCompare(b.descricao, "pt-BR"));

        return { nome, contatoId, clientes, origem: "contato" };
    });

    // Le os bytes de UM anexo, so no clique de download. Nao valida se o anexo pertence a um
    // chamado do requisitante logado - o servico ja expoe ServiceRequests sem filtro
    // server-side (quem filtra por BuyerMainContactPartyID e a query do frontend), entao uma
    // checagem so aqui seria inconsistente. Fica registrado como risco aceito.
    this.on("AnexoConteudo", async (req) => {
        const objectID = String(req.data.objectID || "").trim();

        if (!objectID) {
            return req.reject(400, "objectID e obrigatorio: e o ObjectID do anexo no C4C.");
        }

        const { ServiceRequestAttachmentFolderCollection } = ticketService.entities;

        let linha;
        try {
            // SELECT montado AQUI, nunca repassado de req.query: em query vinda do adapter V4 o
            // Binary ja foi apagado do columns. Montada no servidor ela sai intacta como
            // GET ServiceRequestAttachmentFolderCollection('<id>')?$select=Name,MimeType,Binary
            // (o apostrofo do literal e duplicado pelo proprio urlify do CAP).
            linha = linhasDaResposta(await ticketService.run(
                SELECT.one
                    .from(ServiceRequestAttachmentFolderCollection, { ObjectID: objectID })
                    .columns("Name", "MimeType", "Binary")
            ))[0];
        } catch (erro) {
            return req.reject(
                erro.statusCode || 502,
                `Falha ao ler o conteudo do anexo ${objectID} no C4C: ${erro.message}`
            );
        }

        if (!linha) {
            return req.reject(404, `Anexo ${objectID} nao encontrado no C4C.`);
        }

        // O Edm.Binary do C4C chega como string base64 (o conversor de resposta do kind
        // odata-v2 so mexe em data/hora). O toString cobre a hipotese de vir Buffer - o
        // contrato da function e base64 e a conversao nao pode acontecer duas vezes.
        const base64 = Buffer.isBuffer(linha.Binary)
            ? linha.Binary.toString("base64")
            : String(linha.Binary || "");

        // Anexo por LINK (DocumentLink/LinkWebURI) existe no C4C e nao tem bytes: 404 explicito
        // em vez de devolver base64 vazio e deixar o browser baixar um arquivo de 0 byte.
        if (!base64) {
            return req.reject(404, `Anexo ${objectID} sem conteudo binario no C4C.`);
        }

        return {
            nome: String(linha.Name || "").trim(),
            mimeType: String(linha.MimeType || "").trim() || MIME_TYPE_PADRAO_ANEXO,
            base64
        };
    });

    // Le as interacoes do chamado (ServiceRequestInteractionInteractionsCollection no C4C) e
    // as normaliza para o formato de chat: texto + data bruta (parse no frontend) + autor
    // resolvido (UUID do criador cruzado com EmployeeCollection para nome).
    this.on("InteracoesDoChamado", async (req) => {
        const objectID = String(req.data.objectID || "").trim();

        if (!objectID) {
            return req.reject(400, "objectID e obrigatorio: e o ObjectID do chamado no C4C.");
        }

        let linhas;
        try {
            // Path literal (navegacao profunda no C4C): ServiceRequestInteractionTicketCollection
            // nao tem campo de referencia ao chamado, so existe via associacao. Mesmo path testado
            // no Postman do usuario (servicerequestinteraction.cds:39).
            linhas = linhasDaResposta(await interactionService.send({
                method: "GET",
                path: `/ServiceRequestInteractionTicketCollection('${objectID.replace(/'/g, "''")}')`
                    + `/ServiceRequestInteractionInteractions?$format=json`,
                headers: { Accept: "application/json" }
            }));
        } catch (erro) {
            // Aditivo: falha aqui NAO derruba o chat, que continua funcionando so com notas.
            LOG.warn(`Falha ao ler interacoes do chamado ${objectID}: ${erro.message}`);
            return { interacoes: [] };
        }

        // Resolve autor: usa FromPartyName quando vier preenchido; senao, cruza
        // CreationIdentityUUID com EmployeeCollection.IdentityUUID (via c4codataapi).
        const uuidsParaResolver = [...new Set(
            linhas
                .filter((linha) => !String(linha.FromPartyName || "").trim())
                .map((linha) => String(linha.CreationIdentityUUID || "").trim())
                .filter(Boolean)
        )];

        const nomesPorUuid = new Map();
        if (uuidsParaResolver.length) {
            try {
                const { EmployeeCollection } = employeeAndUserService.entities;
                const empregados = linhasDaResposta(await employeeAndUserService.run(
                    SELECT.from(EmployeeCollection)
                        .columns("IdentityUUID", "BusinessPartnerFormattedName", "FirstName", "LastName")
                        .where((e) => e.IdentityUUID.in(uuidsParaResolver))
                ));

                for (const emp of empregados) {
                    const uuid = String(emp.IdentityUUID || "").trim();
                    const nome = String(emp.BusinessPartnerFormattedName || "").trim()
                        || [emp.FirstName, emp.LastName].map((p) => String(p || "").trim())
                            .filter(Boolean).join(" ");
                    if (uuid && nome) nomesPorUuid.set(uuid, nome);
                }
            } catch (erro) {
                LOG.warn(`Falha ao resolver autores das interacoes do chamado ${objectID}: ${erro.message}`);
            }
        }

        const interacoes = linhas
            .map((linha) => ({
                texto: String(linha.Text || "").trim(),
                quando: linha.CreationDateTime ?? null,
                autor: String(linha.FromPartyName || "").trim()
                    || nomesPorUuid.get(String(linha.CreationIdentityUUID || "").trim())
                    || ""
            }))
            .filter((interacao) => interacao.texto);

        return { interacoes };
    });

    this.on("ComponentesSap", async (req) => {
        const busca = String(req.data.busca || "").trim();

        const parametros = new URLSearchParams({
            selectable: "true",
            limit: String(LIMITE_COMPONENTES_SAP)
        });

        if (busca && /^(?=.*[a-zA-Z])[a-zA-Z*-]{1,40}$/.test(busca)) {
            parametros.set("componentIdSearchText", busca);
        }

        let resposta;
        try {
            const calmItsmService = await conectarCalmItsm();
            resposta = await calmItsmService.send({
                method: "GET",
                path: `/supportcases/masterdata/components?${parametros}`
            });
        } catch (erro) {
            LOG.warn(`Falha ao ler componentes do SAP Cloud ALM: ${erro.message}`);
            return req.reject(502,
                `Nao foi possivel consultar os componentes do SAP Cloud ALM: ${erro.message}`);
        }

        const linhas = Array.isArray(resposta?.results) ? resposta.results : [];

        return {
            total: Number(resposta?.totalCount ?? linhas.length),
            exibidos: linhas.length,
            componentes: linhas.map((linha) => ({
                id: String(linha.componentId ?? ""),
                chave: String(linha.componentKey ?? ""),
                descricao: String(linha.description ?? ""),
                produto: String(linha.productDescription ?? ""),
                obsoleto: Boolean(linha.obsolete)
            }))
        };
    });
});