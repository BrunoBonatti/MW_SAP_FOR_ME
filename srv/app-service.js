const cds = require("@sap/cds");

const LOG = cds.log("app-service");

const EMAIL_CONTATO_DEV = "Thor.boantti@test.com.br";
// Nome totalmente qualificado (db/schema.cds): passado como STRING para SELECT/UPSERT porque a
// entidade e local (persistida), nao exposta em nenhuma projection da IntegrationService.
const CHAT_VISUALIZACOES = "megawork.mwmonitorchamados.ChatVisualizacoes";
// Mesmo par que Main.controller.js usa para decidir "e mensagem de chat" (TYPE_CODES_CHAT_C4C
// menos a descricao 10004): 10007 = Reply to Customer, 10008 = Reply from Customer.
const TYPE_CODES_MENSAGEM_CHAT = ["10007", "10008"];
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

// Cliente unico do contrato; env var so como escape se a Megawork mudar de numero.
const CUSTOMER_NUMBER_SAP = process.env.SAP_CUSTOMER_NUMBER || "0000832647";

// Teto por pagina imposto pelo spec da ALM.
const LIMITE_CONTATOS_SAP = 1000;

// Trava contra giro infinito se totalCount vier maior que a lista realmente paginada.
const MAXIMO_PAGINAS_CONTATOS_SAP = 20;

const LIMITE_CLIENTES_SAP = 200;

// Trava anti-loop contra offset ignorado, nao teto de capacidade: os tetos globais fecham antes.
const MAXIMO_PAGINAS_CLIENTES_SAP = 20;

// Cada cliente vira chamada a cases/ids e a tela espera todas.
const MAXIMO_CLIENTES_SAP = 100;

// Teto do spec de cases/ids: acima de 5 customerNumber por chamada a ALM recusa a consulta.
const MAXIMO_CLIENTES_POR_LOTE_SAP = 5;

const LIMITE_CHAMADOS_SAP = 500;

const MAXIMO_PAGINAS_CHAMADOS_SAP = 20;

// Teto de itens: so vale na fase de profundidade, senao cortaria cliente que nem foi lido.
const MAXIMO_TOTAL_CHAMADOS_SAP = 10000;

const MAXIMO_CHAMADAS_CHAMADOS_SAP = 60;

// Lotes em serie levavam ~6 min: a latencia da ALM por chamada e que domina, nao a CPU.
const LOTES_SIMULTANEOS_CHAMADOS_SAP = Number(process.env.SAP_LOTES_SIMULTANEOS || 6);

// Reabrir a tela nao pode repagar a varredura inteira; curto para nao esconder chamado novo.
const TTL_CACHE_CHAMADOS_SAP_MS = 5 * 60 * 1000;

const cacheChamadosSap = new Map();

function escaparHtml(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// Pool de concorrencia generico: "quantos" workers (limitados por iLimite) disputam trabalho
// chamando "trabalhador" repetidas vezes ate o chamador decidir que acabou (o proprio
// trabalhador controla o fim, tipicamente consumindo de um indice/fila compartilhados).
// Extraido do handler ChamadosSap (unico uso original) para ser reaproveitado por
// ChamadosComMensagemNova (checagem de interacao por chamado).
const emParalelo = (iLimite, quantos, trabalhador) =>
    Promise.all(Array.from({ length: Math.max(1, Math.min(iLimite, quantos)) }, trabalhador));

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
                    "BusinessPartnerID",
                    "BusinessPartnerFormattedName"
                )
                .where({ Email: email })
        ));

        // O mesmo e-mail pode ter mais de um registro e a ordem do C4C nao e contratual: desempate
        // local por BusinessPartnerID, porque um $orderby recusado viraria "nao achou" no catch.
        const funcionarios = linhas.filter(Boolean);
        funcionarios.sort((a, b) =>
            String(a.BusinessPartnerID || "").localeCompare(String(b.BusinessPartnerID || "")));

        return funcionarios[0] || null;
    } catch (erro) {
        LOG.warn(
            `Falha ao consultar EmployeeCollection para o e-mail ${email}; ` +
            `tratando como requisitante nao encontrado: ${erro.message}`
        );
        return null;
    }
}

// Devolve lidos/total junto com o contato porque varredura truncada e cadastro inexistente dao
// o mesmo 404 na tela e so o log separa os dois. Nao trata erro: quem chama traduz para 502.
async function varrerContatosSap(calmItsmService, email, customerNumber) {
    let pessoa = null;
    let lidos = 0;
    let total = 0;
    let primeiroDaPaginaAnterior = "";

    for (let pagina = 0; pagina < MAXIMO_PAGINAS_CONTATOS_SAP; pagina += 1) {
        const parametros = new URLSearchParams({
            customerNumber,
            email,
            // Sem ALL o default e ADMIN e quem nao tem "Edit Authorizations" some da lista.
            authorizationObjects: "ALL",
            offset: String(lidos),
            limit: String(LIMITE_CONTATOS_SAP)
        });

        const resposta = await calmItsmService.send({
            method: "GET",
            path: `/supportcases/masterdata/contacts?${parametros}`
        });

        const linhas = Array.isArray(resposta?.results) ? resposta.results : [];
        total = Number(resposta?.totalCount ?? linhas.length);
        lidos += linhas.length;

        // "email" nao existe no spec: a API pode ignorar o filtro e devolver a lista inteira.
        const candidatos = linhas.filter((linha) =>
            String(linha.email || "").trim().toLowerCase() === email);
        pessoa = candidatos[0] ?? null;

        if (candidatos.length > 1) {
            LOG.warn(`${candidatos.length} S-Users com o e-mail ${email} no customer `
                + `${customerNumber}; usando ${candidatos[0].suser} (ordem nao contratual).`);
        }

        // API que ignorasse o offset devolveria a mesma pagina ate estourar o rate limit.
        const primeiro = String(linhas[0]?.suser ?? "");
        const paginaRepetida = Boolean(primeiro) && primeiro === primeiroDaPaginaAnterior;
        primeiroDaPaginaAnterior = primeiro;

        // Parar antes de cobrir totalCount viraria 404 falso com a pessoa na pagina seguinte.
        if (pessoa || !linhas.length || paginaRepetida || lidos >= total) break;
    }

    return { pessoa, lidos, total };
}

function contatoSapComoResposta(pessoa) {
    return {
        sUser: String(pessoa.suser ?? ""),
        nome: [pessoa.firstname, pessoa.surname]
            .map((parte) => String(parte || "").trim())
            .filter(Boolean)
            .join(" "),
        primeiroNome: String(pessoa.firstname ?? "").trim(),
        email: String(pessoa.email ?? ""),
        // || e nao ??: os campos vazios da ALM chegam como "" e passariam pelo ??.
        telefone: String(pessoa.phone || pessoa.phone2 || "")
    };
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
    // Unica entidade LOCAL (persistida) do servico: ChatVisualizacoes, db/schema.cds. Resolvida
    // via connect.to("db") + .run(), no mesmo estilo dos servicos remotos acima, e nao com
    // SELECT/UPSERT soltos - estes dependem de globals que `cds run`/`cds watch` (via cds-dk)
    // podem nao amarrar a conexao certa quando ha uma copia aninhada de @sap/cds em
    // node_modules/@sap/cds-dk/node_modules (MEDIDO: "no primary database is connected").
    const dbService = await cds.connect.to("db");

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

            // BusinessPartnerID e o identificador que o C4C aceita em BuyerMainContactPartyID;
            // vazio aqui = o frontend trata como "nao achou" e bloqueia a tela.
            return {
                nome: String(funcionario.BusinessPartnerFormattedName || "").trim(),
                contatoId: String(funcionario.BusinessPartnerID == null
                    ? "" : funcionario.BusinessPartnerID).trim(),
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

    // Sustentam a notificacao de mensagem nova em Chats/sino (Main.controller.js,
    // _verificarNotificacoesChats): so guardam quando o requisitante abriu o chat de cada
    // chamado pela ultima vez, nunca mensagem nenhuma - as mensagens continuam vindo do C4C
    // (ServiceRequestTextCollection/InteracoesDoChamado) toda vez que o chat e aberto.
    this.on("ChamadosComMensagemNova", async (req) => {
        const emailInformado = (req.data.email || "").trim();
        const emailLogado = (req.user && req.user.attr && req.user.attr.email) || "";
        const email = emailInformado || emailLogado || EMAIL_CONTATO_DEV;

        const aChamados = Array.isArray(req.data.chamados) ? req.data.chamados : [];
        if (!aChamados.length) {
            return { ticketIds: [] };
        }

        const aVisualizacoes = await dbService.run(
            SELECT.from(CHAT_VISUALIZACOES).where({ usuario: email })
        );
        const mVisualizadoEm = new Map(aVisualizacoes.map((linha) => [linha.ticketId, linha.visualizadoEm]));

        // Nunca visualizado = notifica direto, sem gastar chamada nenhuma no C4C pra ele.
        const aTicketIds = aChamados
            .filter((oChamado) => !mVisualizadoEm.has(String(oChamado.ticketId || "")))
            .map((oChamado) => String(oChamado.ticketId || ""))
            .filter(Boolean);

        // Ja visualizados: um por um (nao em lote). Tentei um filtro OR de ParentObjectID pra
        // checar todos numa chamada so, mas MEDIDO contra o tenant que o parser do C4C e
        // instavel com OR de 2+ valores: as vezes devolve VAZIO sem erro (silenciosamente
        // ignorando candidatos validos - pior que lento, e ERRADO, o mesmo tipo de bug que
        // reverteu a tentativa anterior) e as vezes rejeita com "Ungultigen Token", dependendo
        // do valor. So a checagem POR CHAMADO (uma unica igualdade no filtro, sem OR nenhum) se
        // mostrou estavel em todos os testes. Por isso nota e interacao sao checadas juntas, uma
        // chamada de cada por candidato, em paralelo com o mesmo limite de concorrencia que
        // ChamadosSap ja usa pra nao martelar o C4C.
        const aCandidatos = aChamados
            .filter((oChamado) => mVisualizadoEm.has(String(oChamado.ticketId || "")))
            .map((oChamado) => ({
                ticketId: String(oChamado.ticketId || ""),
                objectID: String(oChamado.objectID || ""),
                visualizadoEm: mVisualizadoEm.get(String(oChamado.ticketId || ""))
            }))
            .filter((oCand) => oCand.objectID);

        if (aCandidatos.length) {
            const sFiltroTypeCode = TYPE_CODES_MENSAGEM_CHAT
                .map((sTypeCode) => `TypeCode eq '${sTypeCode}'`)
                .join(" or ");

            let iProximo = 0;

            await emParalelo(LOTES_SIMULTANEOS_CHAMADOS_SAP, aCandidatos.length, async () => {
                while (iProximo < aCandidatos.length) {
                    const oCand = aCandidatos[iProximo];
                    iProximo += 1;

                    const sObjectID = oCand.objectID.replace(/'/g, "''");
                    const sData = new Date(oCand.visualizadoEm).toISOString();

                    // Nota: TypeCode 10007/10008 (mesmo par que o app usa pra enviar mensagem).
                    let bNotaNova = false;
                    try {
                        const aNotas = linhasDaResposta(await ticketService.send({
                            method: "GET",
                            path: "/ServiceRequestTextCollectionCollection?$filter="
                                + encodeURIComponent(`(${sFiltroTypeCode}) and ParentObjectID eq '${sObjectID}' `
                                    + `and CreatedOn gt datetimeoffset'${sData}'`)
                                + "&$top=1&$select=ParentObjectID&$format=json",
                            headers: { Accept: "application/json" }
                        }));
                        bNotaNova = aNotas.length > 0;
                    } catch (erro) {
                        LOG.warn(`Falha ao checar nota nova do chamado ${oCand.ticketId}: ${erro.message}`);
                    }

                    if (bNotaNova) {
                        aTicketIds.push(oCand.ticketId);
                        continue;
                    }

                    // Interacao: mensagem digitada direto no Sales Cloud, que NAO vira nota - so
                    // checada quando nao ha nota nova, pra nao gastar a segunda chamada a toa.
                    try {
                        const aInteracoesNovas = linhasDaResposta(await interactionService.send({
                            method: "GET",
                            path: `/ServiceRequestInteractionTicketCollection('${sObjectID}')`
                                + "/ServiceRequestInteractionInteractions?$filter="
                                + encodeURIComponent(`CreationDateTime gt datetimeoffset'${sData}'`)
                                + "&$top=1&$select=ObjectID&$format=json",
                            headers: { Accept: "application/json" }
                        }));

                        if (aInteracoesNovas.length) {
                            aTicketIds.push(oCand.ticketId);
                        }
                    } catch (erro) {
                        // Falha ISOLADA: so este chamado fica sem checagem de interacao nesta
                        // rodada, os demais e o resultado geral seguem intactos.
                        LOG.warn(`Falha ao checar interacao nova do chamado ${oCand.ticketId}: ${erro.message}`);
                    }
                }
            });
        }

        return { ticketIds: aTicketIds };
    });

    this.on("MarcarChatVisualizado", async (req) => {
        const emailInformado = (req.data.email || "").trim();
        const emailLogado = (req.user && req.user.attr && req.user.attr.email) || "";
        const email = emailInformado || emailLogado || EMAIL_CONTATO_DEV;
        const ticketId = String(req.data.ticketId || "").trim();

        if (!email || !ticketId) {
            return req.reject(400, "ticketId é obrigatório.");
        }

        await dbService.run(UPSERT.into(CHAT_VISUALIZACOES).entries({ usuario: email, ticketId }));

        return true;
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

    this.on("AmbientesSap", async (req) => {
        const customerNumber = String(req.data.customerNumber || "").trim() || CUSTOMER_NUMBER_SAP;

        // select=landscapeObjects descarta o bloco globalSUsers, que nao vai para a tela.
        const parametros = new URLSearchParams({ customerNumber, select: "landscapeObjects" });

        let resposta;
        try {
            const calmItsmService = await conectarCalmItsm();
            resposta = await calmItsmService.send({
                method: "GET",
                path: `/supportcases/masterdata/landscapeObjectsExtended?${parametros}`
            });
        } catch (erro) {
            LOG.warn(`Falha ao ler ambientes do SAP Cloud ALM: ${erro.message}`);
            return req.reject(502,
                `Nao foi possivel consultar os ambientes do SAP Cloud ALM: ${erro.message}`);
        }

        // Sem results na raiz como o resto da ALM: cada bloco traz o seu (ver spec do endpoint).
        const linhas = Array.isArray(resposta?.landscapeObjects?.results)
            ? resposta.landscapeObjects.results
            : [];

        // Dedupe: o sistema se repete por produto instalado e sairia identico na lista de ajuda.
        const ambientes = [];
        const vistos = new Set();

        for (const linha of linhas) {
            const ambiente = {
                installationNbr: String(linha.installationNbr ?? ""),
                systemNbr: String(linha.systemNbr ?? ""),
                systemName: String(linha.systemName ?? ""),
                systemType: String(linha.systemType ?? ""),
                systemId: String(linha.systemId ?? "")
            };
            const chave = `${ambiente.installationNbr}|${ambiente.systemNbr}|${ambiente.systemId}`;

            if (vistos.has(chave)) continue;

            vistos.add(chave);
            ambientes.push(ambiente);
        }

        if (!ambientes.length) {
            LOG.warn(`SAP Cloud ALM nao devolveu ambientes para o customer ${customerNumber}.`);
        }

        return {
            total: Number(resposta?.landscapeObjects?.totalCount ?? linhas.length),
            exibidos: ambientes.length,
            ambientes
        };
    });

    this.on("ContatoSap", async (req) => {
        const email = String(req.data.email || "").trim().toLowerCase();

        if (!email) {
            return req.reject(400, "Informe o e-mail para localizar o S-User no SAP Cloud ALM.");
        }

        let varredura;
        try {
            varredura = await varrerContatosSap(await conectarCalmItsm(), email, CUSTOMER_NUMBER_SAP);
        } catch (erro) {
            LOG.warn(`Falha ao ler contatos do SAP Cloud ALM: ${erro.message}`);
            return req.reject(502,
                `Nao foi possivel consultar os contatos do SAP Cloud ALM: ${erro.message}`);
        }

        if (!varredura.pessoa) {
            // Varredura truncada e cadastro inexistente dao o mesmo 404 na tela.
            if (varredura.lidos < varredura.total) {
                LOG.warn(`Contatos lidos parcialmente (${varredura.lidos}/${varredura.total}) `
                    + `ao procurar ${email}.`);
            }

            return req.reject(404, `Nenhum S-User encontrado para o e-mail ${email}.`);
        }

        return contatoSapComoResposta(varredura.pessoa);
    });

    // S-User do requisitante DO CHAMADO, nao do usuario logado: o detalhe so tem o nome dele
    // (BuyerMainContactPartyName), entao o e-mail sai de uma consulta a ContactCollection antes
    // de a ALM ser chamada. Os dois passos ficam no servidor para a tela nao pagar 2 roundtrips.
    this.on("ContatoSapPorNome", async (req) => {
        const nome = String(req.data.nome || "").trim();

        if (!nome) {
            return req.reject(400,
                "Informe o nome do requisitante para localizar o S-User no SAP Cloud ALM.");
        }

        let contatos;
        try {
            const { ContactCollection } = contactService.entities;
            contatos = linhasDaResposta(await contactService.run(
                SELECT.from(ContactCollection)
                    .columns("ContactID", "Name", "Email")
                    .where({ Name: nome })
            ));
        } catch (erro) {
            LOG.warn(`Falha ao consultar a ContactCollection pelo nome ${nome}: ${erro.message}`);
            return req.reject(502,
                `Nao foi possivel consultar o contato ${nome} no C4C: ${erro.message}`);
        }

        // Homonimo e cadastro duplicado existem no C4C: desempate local por ContactID, porque um
        // $orderby recusado derrubaria a consulta inteira.
        const comEmail = contatos
            .filter((linha) => linha && String(linha.Email || "").trim())
            .sort((a, b) => String(a.ContactID || "").localeCompare(String(b.ContactID || "")));

        const emailsDistintos = new Set(comEmail.map((linha) =>
            String(linha.Email).trim().toLowerCase()));

        if (emailsDistintos.size > 1) {
            LOG.warn(`${emailsDistintos.size} e-mails distintos para o nome ${nome} no C4C; `
                + `usando o do contato ${comEmail[0].ContactID}.`);
        }

        const email = String(comEmail[0]?.Email ?? "").trim().toLowerCase();

        if (!email) {
            // Sem e-mail nao ha como consultar a ALM; 404 e nao 502 porque isso e cadastro.
            LOG.warn(`Requisitante ${nome} sem e-mail utilizavel no C4C `
                + `(${contatos.length} contatos com esse nome).`);

            return req.reject(404, `Nenhum e-mail encontrado no C4C para o requisitante ${nome}.`);
        }

        let varredura;
        try {
            varredura = await varrerContatosSap(await conectarCalmItsm(), email, CUSTOMER_NUMBER_SAP);
        } catch (erro) {
            LOG.warn(`Falha ao ler contatos do SAP Cloud ALM para ${nome} (${email}): ${erro.message}`);
            return req.reject(502,
                `Nao foi possivel consultar os contatos do SAP Cloud ALM: ${erro.message}`);
        }

        if (!varredura.pessoa) {
            if (varredura.lidos < varredura.total) {
                LOG.warn(`Contatos lidos parcialmente (${varredura.lidos}/${varredura.total}) `
                    + `ao procurar ${email} no customer ${CUSTOMER_NUMBER_SAP}.`);
            }

            return req.reject(404, `Nenhum S-User encontrado para o requisitante ${nome} `
                + `(${email}) no customer ${CUSTOMER_NUMBER_SAP}.`);
        }

        return contatoSapComoResposta(varredura.pessoa);
    });

    this.on("ChamadosSap", async (req) => {
        const sUser = String(req.data.sUser || "").trim();

        if (!sUser) {
            return req.reject(400, "Informe o S-User para consultar os chamados do SAP Cloud ALM.");
        }

        for (const [chave, entrada] of cacheChamadosSap) {
            if (Date.now() - entrada.quando >= TTL_CACHE_CHAMADOS_SAP_MS) cacheChamadosSap.delete(chave);
        }

        const emCache = cacheChamadosSap.get(sUser);

        if (!req.data.atualizar && emCache) {
            LOG.info(`Chamados SAP do S-User ${sUser} servidos do cache `
                + `(${emCache.dados.exibidos} chamados, ${Date.now() - emCache.quando} ms de idade).`);

            // Copia: o consumidor mexer no array devolvido corromperia a entrada cacheada.
            return { ...emCache.dados, chamados: emCache.dados.chamados.slice() };
        }

        const inicioTudo = Date.now();

        let calmItsmService;
        const clientes = [];
        const clientesVistos = new Set();

        try {
            calmItsmService = await conectarCalmItsm();

            let clientesLidos = 0;
            let totalClientes = 0;
            let primeiroClienteAnterior = "";

            for (let pagina = 0; pagina < MAXIMO_PAGINAS_CLIENTES_SAP; pagina += 1) {
                const parametros = new URLSearchParams({
                    reporter: sUser,
                    offset: String(clientesLidos),
                    limit: String(LIMITE_CLIENTES_SAP)
                });

                const resposta = await calmItsmService.send({
                    method: "GET",
                    path: `/supportcases/masterdata/customers?${parametros}`
                });

                const linhas = Array.isArray(resposta?.results) ? resposta.results : [];
                totalClientes = Number(resposta?.totalCount ?? linhas.length);
                clientesLidos += linhas.length;

                for (const linha of linhas) {
                    const cliente = String(linha?.customerNumber ?? "").trim();
                    // Um cliente por relationshipType: sem dedupe o mesmo lote iria duas vezes.
                    if (!cliente || clientesVistos.has(cliente)) continue;
                    clientesVistos.add(cliente);
                    clientes.push(cliente);
                }

                // Offset ignorado repetiria a pagina ate estourar o rate limit.
                const primeiro = String(linhas[0]?.customerNumber ?? "");
                const paginaRepetida = Boolean(primeiro) && primeiro === primeiroClienteAnterior;
                primeiroClienteAnterior = primeiro;

                if (!linhas.length || paginaRepetida || clientesLidos >= totalClientes
                    || clientes.length >= MAXIMO_CLIENTES_SAP) break;
            }
        } catch (erro) {
            LOG.warn(`Falha ao ler os clientes do S-User ${sUser} no SAP Cloud ALM: ${erro.message}`);
            return req.reject(502,
                `Nao foi possivel consultar os clientes do SAP Cloud ALM: ${erro.message}`);
        }

        if (!clientes.length) {
            // Sem escopo, cases/ids vazaria case alheio: melhor lista vazia que consulta aberta.
            LOG.warn(`Nenhum cliente vinculado ao S-User ${sUser} em masterdata/customers; `
                + "a lista de chamados SAP volta vazia.");
            return { total: 0, exibidos: 0, chamados: [] };
        }

        if (clientes.length > MAXIMO_CLIENTES_SAP) {
            LOG.warn(`S-User ${sUser} tem mais de ${MAXIMO_CLIENTES_SAP} clientes; `
                + "a lista de chamados SAP cobre so os primeiros.");
            clientes.length = MAXIMO_CLIENTES_SAP;
        }

        const msClientes = Date.now() - inicioTudo;

        const lotes = [];
        for (let inicio = 0; inicio < clientes.length; inicio += MAXIMO_CLIENTES_POR_LOTE_SAP) {
            lotes.push(clientes.slice(inicio, inicio + MAXIMO_CLIENTES_POR_LOTE_SAP));
        }

        const chamados = [];
        const correlacoesVistas = new Set();
        let total = 0;
        let lotesComFalha = 0;
        let chamadasFeitas = 0;
        let ultimoErro = "";

        const estados = lotes.map((lote) => ({
            lote,
            // Chutar um cliente do lote faria o detalhe pedir o case ao cliente errado.
            clienteDoLote: lote.length === 1 ? lote[0] : "",
            chamadosLidos: 0,
            totalDoLote: 0,
            primeiraCorrelacaoAnterior: "",
            paginas: 0,
            concluido: false,
            falhou: false
        }));

        const lerPagina = async (estado) => {
            const parametros = new URLSearchParams({
                reporter: sUser,
                offset: String(estado.chamadosLidos),
                limit: String(LIMITE_CHAMADOS_SAP)
            });

            // join(",") viraria um numero de cliente inexistente e nao filtraria nada.
            for (const cliente of estado.lote) parametros.append("customerNumber", cliente);

            chamadasFeitas += 1;

            let resposta;
            try {
                resposta = await calmItsmService.send({
                    method: "GET",
                    path: `/supportcases/cases/ids?${parametros}`
                });
            } catch (erro) {
                estado.falhou = true;
                lotesComFalha += 1;
                ultimoErro = erro.message;
                // Um lote quebrado nao pode zerar a tela: os outros clientes continuam valendo.
                LOG.warn(`Falha ao ler chamados do SAP Cloud ALM dos clientes ${estado.lote.join(", ")} `
                    + `(S-User ${sUser}): ${erro.message}`);

                // 429: paralelismo alto demais, e o lote perdido sai da lista sem erro na tela.
                if (Number(erro?.status ?? erro?.statusCode ?? 0) === 429) {
                    LOG.warn(`Rate limit da ALM atingido com ${LOTES_SIMULTANEOS_CHAMADOS_SAP} lotes `
                        + "simultaneos; reduza SAP_LOTES_SIMULTANEOS.");
                }

                return;
            }

            const linhas = Array.isArray(resposta?.results) ? resposta.results : [];

            // totalCount se repete em toda pagina do lote: somar uma vez, na primeira.
            if (!estado.paginas) total += Number(resposta?.totalCount ?? linhas.length);

            estado.paginas += 1;
            estado.totalDoLote = Number(resposta?.totalCount ?? linhas.length);
            estado.chamadosLidos += linhas.length;

            for (const linha of linhas) {
                const correlationId = String(linha?.correlationId ?? "").trim();
                // O mesmo case volta em mais de um cliente quando ha hierarquia VAR.
                if (!correlationId || correlacoesVistas.has(correlationId)) continue;
                correlacoesVistas.add(correlationId);
                chamados.push({ correlationId, customerNumber: estado.clienteDoLote });
            }

            const primeira = String(linhas[0]?.correlationId ?? "");
            // Offset ignorado repetiria a pagina ate estourar o rate limit.
            const paginaRepetida = Boolean(primeira) && primeira === estado.primeiraCorrelacaoAnterior;
            estado.primeiraCorrelacaoAnterior = primeira;

            if (!linhas.length || paginaRepetida || estado.chamadosLidos >= estado.totalDoLote
                || estado.paginas >= MAXIMO_PAGINAS_CHAMADOS_SAP) {
                estado.concluido = true;
            }
        };

        // Fase A: pagina 1 de TODO lote, sem teto, senao cliente inteiro sai da tela em silencio.
        let proximoLote = 0;
        await emParalelo(LOTES_SIMULTANEOS_CHAMADOS_SAP, estados.length, async () => {
            while (proximoLote < estados.length) {
                const indice = proximoLote;
                proximoLote += 1;

                await lerPagina(estados[indice]);
            }
        });

        // Fase B: profundidade dos lotes que sobraram, dividida entre eles e limitada pelos tetos.
        const fila = estados.filter((estado) => !estado.concluido && !estado.falhou);
        let proximaUnidade = 0;
        let tetoAtingido = false;

        await emParalelo(LOTES_SIMULTANEOS_CHAMADOS_SAP, fila.length, async () => {
            while (proximaUnidade < fila.length) {
                if (chamados.length >= MAXIMO_TOTAL_CHAMADOS_SAP
                    || chamadasFeitas >= MAXIMO_CHAMADAS_CHAMADOS_SAP) {
                    tetoAtingido = true;
                    return;
                }

                const indice = proximaUnidade;
                proximaUnidade += 1;
                const estado = fila[indice];

                await lerPagina(estado);

                // Volta ao fim da fila: a profundidade e dividida entre todos, nao gasta num so.
                if (!estado.concluido && !estado.falhou) fila.push(estado);
            }
        });

        const lotesTruncados = estados.filter((estado) =>
            !estado.falhou && !estado.concluido).length;

        if (tetoAtingido) {
            LOG.warn(`Leitura de chamados SAP truncada por teto (S-User ${sUser}): `
                + `${lotesTruncados} lotes com historico nao lido por inteiro.`);
        }

        for (const estado of estados) {
            // Truncado por teto: sem o aviso o parcial passa por lista completa no suporte.
            if (estado.falhou || estado.concluido) continue;
            LOG.warn(`Chamados lidos parcialmente (${estado.chamadosLidos}/${estado.totalDoLote}) nos `
                + `clientes ${estado.lote.join(", ")} (S-User ${sUser}).`);
        }

        // Lista vazia com lote quebrado viraria "nenhum chamado" na tela, sem sinal de falha.
        if (lotesComFalha && !chamados.length) {
            return req.reject(502,
                `Nao foi possivel consultar os chamados do SAP Cloud ALM: ${ultimoErro}`);
        }

        const dados = { total, exibidos: chamados.length, chamados };

        cacheChamadosSap.set(sUser, { quando: Date.now(), dados });

        // Diagnostico de lentidao: e a latencia por chamada da ALM que manda no tempo total.
        LOG.info(`Chamados SAP do S-User ${sUser}: ${clientes.length} clientes em ${msClientes} ms, `
            + `${lotes.length} lotes / ${chamadasFeitas} chamadas a cases/ids em `
            + `${Date.now() - inicioTudo - msClientes} ms (${LOTES_SIMULTANEOS_CHAMADOS_SAP} simultaneos), `
            + `${chamados.length} chamados, ${lotesComFalha} lotes com falha, `
            + `${lotesTruncados} truncados. Total ${Date.now() - inicioTudo} ms.`);

        return dados;
    });
});