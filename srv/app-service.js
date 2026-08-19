const cds = require("@sap/cds");

const LOG = cds.log("app-service");

const EMAIL_CONTATO_DEV = "Thor.boantti@test.com.br";

// Identidade do dono do badge de chat. Existe porque a chave de ChatVisualizacoes e
// (usuario, ticketId): errar o e-mail faz TODOS os usuarios dividirem a mesma linha e um zerar o
// badge do outro. Regra por perfil:
//  - development: mantem o trio de hoje (req.data.email primeiro), senao o cds watch local, que
//    nao tem JWT nenhum, ficaria sem identidade e sem notificacao;
//  - producao: o JWT MANDA, porque req.data.email vem do navegador e qualquer cliente poderia
//    passar o e-mail de outro. O fallback pro req.data.email fica de reserva DELIBERADA: se o
//    xsuaa nao popular attr.email no Work Zone, o app degrada em vez de ficar sem sino algum -
//    e o LOG.warn marca exatamente esse caso pra nao virar comportamento silencioso.
// Deteccao de perfil: cds.env.profiles (["development"] no cds watch) OU as variaveis que so
// existem dentro do Cloud Foundry - a segunda cobre o caso de o perfil nao ser propagado no
// deploy. VCAP_APPLICATION vem antes de proposito: o CF sempre a injeta, enquanto VCAP_SERVICES
// so aparece quando ha binding - um deploy de troubleshooting sem binding cairia em development
// e voltaria a aceitar o e-mail que o navegador mandar.
function ehProducao() {
    const aPerfis = (cds.env && cds.env.profiles) || [];
    return (Array.isArray(aPerfis) && aPerfis.includes("production"))
        || !!process.env.VCAP_APPLICATION
        || !!process.env.VCAP_SERVICES;
}

// Normaliza SEMPRE: a chave do HANA e case-sensitive e a gravacao ja fazia trim enquanto a
// leitura nao - so isso ja bastava pra "Fulano@x" e "fulano@x " virarem linhas diferentes.
function resolverEmailDoChat(req) {
    const sEmailInformado = String((req.data && req.data.email) || "").trim();
    const sEmailLogado = String((req.user && req.user.attr && req.user.attr.email) || "").trim();

    if (!ehProducao()) {
        return (sEmailInformado || sEmailLogado || EMAIL_CONTATO_DEV).trim().toLowerCase();
    }

    if (sEmailLogado) {
        return sEmailLogado.trim().toLowerCase();
    }

    if (sEmailInformado) {
        LOG.warn("JWT sem attr.email em producao: usando o e-mail informado pelo frontend como "
            + "fallback do badge de chat. Conferir o escopo/atributo do xsuaa.");
        return sEmailInformado.trim().toLowerCase();
    }

    // Ultimo recurso antes de nao ter identidade nenhuma: no xsuaa/IAS o req.user.id costuma ser
    // o proprio logon, que neste subaccount e o e-mail. So vale se PARECER e-mail - o id tecnico
    // ("sb-mw-...") viraria uma chave compartilhada por todos, que e exatamente o bug 4.1.
    const sIdLogado = String((req.user && req.user.id) || "").trim();
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(sIdLogado)) {
        LOG.warn("JWT sem attr.email e sem e-mail informado: usando o id do usuario logado como "
            + "identidade do badge de chat. Conferir o atributo email do xsuaa.");
        return sIdLogado.toLowerCase();
    }

    // Sem identidade nenhuma. Quem chama TEM de tratar: consultar/gravar com "" faria todos os
    // usuarios nessa condicao dividirem a mesma linha de ChatVisualizacoes.
    return "";
}

// Identidade do REQUISITANTE. O e-mail informado pelo frontend VENCE em qualquer perfil, inclusive
// CF: os ToggleButtons PROVISORIOs do ToolHeader mandam o e-mail escolhido e sao hoje o unico jeito
// de homologar a regra BASIS no Work Zone - com o JWT vencendo, clicar em EDI/PCOE la nao mudava
// nada e a homologacao media sempre o proprio testador.
// O preco esta assumido e registrado: desde o campo basis esta function nao responde so "quem sou
// eu", responde tambem "o que eu posso ver", entao enquanto os botoes existirem um cliente pode
// pedir a identidade de um BASIS e receber basis=true. A regra e de UI e a IntegrationService nao
// tem @requires/@restrict nenhum, entao nao ha segunda barreira. O LOG.warn abaixo e o rastro
// disso: quando os botoes sairem (ver "Remover o botao e o handler antes de ir para producao" na
// view), este ramo sai junto e o JWT volta a mandar sozinho.
// Nao reusa resolverEmailDoChat porque aquela normaliza para minuscula: a chave de
// ChatVisualizacoes e local, mas este e-mail vai cru para o EMailURI da ContactQueryByElements e
// para o filtro Email da EmployeeCollection, comparacoes exatas do C4C - baixar a caixa aqui
// transformaria requisitante existente em "nao encontrado".
function resolverEmailDoRequisitante(req) {
    const emailInformado = String((req.data && req.data.email) || "").trim();
    const emailLogado = String((req.user && req.user.attr && req.user.attr.email) || "").trim();

    if (!ehProducao()) {
        return emailInformado || emailLogado || EMAIL_CONTATO_DEV;
    }

    // PROVISORIO (homologacao): sai junto com os ToggleButtons da view.
    if (emailInformado) {
        LOG.warn(`E-mail de homologacao vencendo o JWT em ambiente CF: requisitante (e basis) `
            + `resolvidos por ${emailInformado} no lugar de ${emailLogado || "<JWT sem attr.email>"}.`);
        return emailInformado;
    }

    return emailLogado;
}
// Nome totalmente qualificado (db/schema.cds): passado como STRING para SELECT/UPSERT porque a
// entidade e local (persistida), nao exposta em nenhuma projection da IntegrationService.
const CHAT_VISUALIZACOES = "megawork.mwmonitorchamados.ChatVisualizacoes";
// Mesmo par que Main.controller.js usa para decidir "e mensagem de chat" (TYPE_CODES_CHAT_C4C
// menos a descricao 10004): 10007 = Reply to Customer, 10008 = Reply from Customer.
const TYPE_CODES_MENSAGEM_CHAT = ["10007", "10008"];
const TYPE_CODE_DESCRICAO = "10004";
const STATUS_INICIAL_CHAMADO = "Z6";

// OrgUnitID (String(20) FixedLength no C4C) das duas unidades que operam o SAP; guardado em
// maiuscula porque a comparacao e feita com trim + toUpperCase - o C4C devolve o codigo padded.
const ORG_UNITS_BASIS = new Set(["BASISID", "AMSBASIS"]);

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

// Tamanho de Z_COMPONENT_SFM_KUT no C4C: acima disso o PATCH volta erro do lado de la.
const TAMANHO_MAXIMO_COMPONENTE_SAP = 40;

// Cliente unico do contrato; env var so como escape se a Megawork mudar de numero.
const CUSTOMER_NUMBER_SAP = process.env.SAP_CUSTOMER_NUMBER || "0000832647";

// Dominio da ALM (CasePost.priority) e enum fechado 1..4; o mapa do C4C manda BAIXA->7 e daria 400.
const PRIORIDADE_CASO_SAP = { IMEDIATA: "1", URGENTE: "2", NORMAL: "3", BAIXA: "4" };

// Teto por pagina imposto pelo spec da ALM.
const LIMITE_CONTATOS_SAP = 1000;

// Trava contra giro infinito se totalCount vier maior que a lista realmente paginada.
const MAXIMO_PAGINAS_CONTATOS_SAP = 20;

// Teto do spec de cases/ids: acima de 5 customerNumber por chamada a ALM recusa a consulta.
const MAXIMO_CLIENTES_POR_LOTE_SAP = 5;

// Cada id soma ~35 caracteres ao $filter; 50 sobra para a tabela e nao chega perto do teto de
// URL do C4C. Nao e teto da ALM, e do GET cru.
const MAXIMO_PARCEIROS_POR_LOTE_SAP = 50;

const LIMITE_CHAMADOS_SAP = 500;

// Teto do GET de detalhe (1 chamada por caso), nao limite documentado da ALM: o dialogo espera a
// resposta, e acima disso a tela trunca com aviso em vez de arriscar 429 e minutos de espera.
const MAXIMO_DETALHES_CASOS_SAP = 24;

// Detalhes em serie custariam ~24 latencias somadas no dialogo; poucos em paralelo evitam o 429.
const DETALHES_SIMULTANEOS_CASOS_SAP = 4;

// Teto GLOBAL da tela, nao por cliente: 10 clientes x 24 detalhes seriam 240 GETs na abertura.
const MAXIMO_DETALHES_CASOS_TELA_SAP = 60;

// limit explicito: sem ele vale o default nao documentado do servidor. 200 fecha a conversa numa
// chamada so; caso que passa disso e patologico, e ai truncado avisa.
const LIMITE_COMENTARIOS_CASO_SAP = 200;

// O POST nao aceita type: sem este valor a tela releria a conversa so para saber o lado da bolha.
const TIPO_COMENTARIO_CLIENTE_SAP = "Info for SAP";

// Teto nosso, nao da API: a SAP corta texto longo em silencio, e um 400 explicito avisa.
const TAMANHO_MAXIMO_COMENTARIO_CASO_SAP = 5000;

// Escopo da lista: funcionario interno entra como executor (espelha o Main.controller.js).
const CAMPO_ESCOPO_REQUISITANTE_C4C = "BuyerMainContactPartyID";
const CAMPO_ESCOPO_EXECUTOR_C4C = "ServicePerformerPartyID";

// SUPOSICAO herdada do frontend: teto de 1000 no C4C, sem sap:maximum-page-size no ticket.edmx.
const LIMITE_CHAMADOS_C4C = 500;

// Trava anti-loop contra $skip ignorado; o teto de itens fecha antes em tenant saudavel.
const MAXIMO_PAGINAS_CHAMADOS_C4C = 40;

// 40 GETs em serie ja arriscam o timeout do approuter: acima disso devolve truncado.
const MAXIMO_TOTAL_CHAMADOS_C4C = 20000;

// Lotes em serie levavam ~6 min: a latencia da ALM por chamada e que domina, nao a CPU.
// Sobreviveu a remocao do handler ChamadosSap: ChamadosComMensagemNova usa o mesmo knob de 429.
// || fora do Number, igual a constante dos clientes: env nao numerica daria NaN e o
// Array.from({length: NaN}) do emParalelo nao criaria trabalhador nenhum - o poll devolveria
// "ninguem tem mensagem nova" em silencio, com HTTP 200.
const LOTES_SIMULTANEOS_CHAMADOS_SAP = Number(process.env.SAP_LOTES_SIMULTANEOS) || 6;

// Rede de seguranca do "chamado recem-aberto nao notifica": a consulta ordenada por CreatedOn foi
// MEDIDA estavel neste tenant (20/20 execucoes, mesmo valor), mas este arquivo ja documenta que o
// parser do C4C as vezes devolve VAZIO SEM ERRO - e vazio, aqui, significaria "sem mensagem".
// Com a env em "0" o fallback legado morre sem deploy; ligado, ele so roda no caso raro
// (consulta ordenada vazia E chamado ja visualizado), entao nao dobra o custo do poll.
const REDE_SEGURANCA_LIGADA = process.env.SAP_NOTIFICACAO_REDE_SEGURANCA !== "0";

// A ultima interacao do chamado costuma ser a que interessa, mas interacao SEM texto existe
// (assunto preenchido e corpo vazio) e o chat nao a mostra: buscar um punhado em vez de uma so
// permite pular as vazias sem uma segunda ida ao C4C. Todas vazias = nenhuma interacao conta,
// que e o resultado conservador (nao acende sino por conversa que o usuario nao veria mudar).
const TOPO_INTERACOES_COM_TEXTO = 5;

// Teto DEFENSIVO do lote (o frontend ja corta antes): cada chamado custa ate 2 GETs no C4C, e um
// cliente desatualizado mandando os 100 da lista estouraria o tenant sozinho.
const MAXIMO_CHAMADOS_POLL_NOTIFICACOES = 30;

// Linha-MARCO da semeadura do badge (D5): ticketId reservado que nao existe no C4C (ID de
// chamado e numerico) e guarda QUANDO o badge passou a valer para o usuario. O gatilho NAO pode
// ser "o usuario nao tem nenhuma linha": um unico MarcarChatVisualizado antes do primeiro poll
// desligaria a semeadura para sempre, e ai todo chamado sem linha voltaria a acender de uma vez.
const TICKET_ID_MARCO_SEMEADURA = "*";

// A data da ultima mensagem e do CHAMADO, nao de quem pergunta, entao da pra dividir a consulta.
// O ganho REAL e menor do que parece: cada usuario so enxerga os chamados em que ele e
// requisitante ou executor (filtro de escopo do frontend), entao dois usuarios quase nunca
// perguntam pelo mesmo objectID, e o TTL e menor que o intervalo do poll (60 s), entao o mesmo
// usuario tambem nao acerta o proprio cache em regime. Quem realmente aproveita: aba duplicada,
// a rajada do visibilitychange e chamado com requisitante e executor olhando ao mesmo tempo.
// 30 s (e nao 60 s+) de proposito: e a data que aparece na lista de chats, e servi-la vencida
// por mais de meia rodada atrasaria a conversa visivelmente sem economizar quase nada.
const TTL_CACHE_ULTIMA_MENSAGEM_MS = 30 * 1000;

// Processo vive semanas no CF: Map indexado por objectID sem teto vira leak.
const MAXIMO_ENTRADAS_CACHE_ULTIMA_MENSAGEM = 500;

// Chave = objectID, NUNCA o usuario: guarda a data da ultima mensagem, jamais a decisao
// mensagemNova (essa depende do visualizadoEm de cada um e e recalculada a cada chamada).
const cacheUltimaMensagemPorChamado = new Map();

// Env propria: SAP_LOTES_SIMULTANEOS e o knob do 429 da ALM, este e do C4C, que tem outro limite.
// || fora do Number: env nao numerica daria NaN e Array.from({length: NaN}) zeraria os lotes.
const LOTES_SIMULTANEOS_CLIENTES_C4C = Number(process.env.SAP_LOTES_SIMULTANEOS_CLIENTES) || 4;

// Consulta de UM parceiro que falha nao e tamanho de lote: apos estas, para de tentar em vez de
// gastar uma requisicao morta por parceiro do tenant.
const MAXIMO_SONDAGENS_FALHAS_CLIENTES = 3;

// A varredura le o tenant inteiro: sem cache cada abertura do popup repaga tudo.
const TTL_CACHE_CLIENTES_DISTINTOS_MS = 5 * 60 * 1000;

const cacheClientesDistintosChamados = new Map();

function escaparHtml(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// Aspas e travessoes entram porque o editor da ALM escapa esses; acentos ela manda em UTF-8 cru.
const ENTIDADES_HTML = {
    amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " ",
    rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”",
    mdash: "—", ndash: "–", hellip: "…", bull: "•"
};

// A bolha da conversa e um sap.m.Text (o markup e o mesmo de Chats.fragment.xml), entao o HTML do
// comentario da ALM chega cru na tela; aqui vira texto com as quebras que o pre-wrap ja renderiza.
function textoSimplesDoHtml(valor) {
    const bruto = String(valor ?? "");
    const temTag = /<\/?[a-z][^>]*>/i.test(bruto);

    const semTags = !temTag ? bruto : bruto
        // Tirar so as tags de script/style deixaria o codigo como texto do comentario.
        .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
        .replace(/<br\s*\/?>/gi, "\n")
        // Linha em branco no fim do bloco: e o que separa os paragrafos do "<p>..</p><p>..</p>".
        .replace(/<\/(?:p|div|h[1-6]|tr|table|ul|ol|blockquote)\s*>/gi, "\n\n")
        // So a abertura gera a quebra; fechar </li> deixaria linha vazia entre os marcadores.
        .replace(/<li\b[^>]*>/gi, "\n- ")
        .replace(/<[^>]*>/g, "");

    // Decodificar so agora, e numa passada so: antes das tags o "&lt;p&gt;" digitado pelo usuario
    // sumiria, e em replaces encadeados o "&amp;lt;" seria decodificado duas vezes.
    const semEntidades = semTags.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (achado, codigo) => {
        if (codigo[0] === "#") {
            const numero = codigo[1] === "x" || codigo[1] === "X"
                ? parseInt(codigo.slice(2), 16)
                : Number(codigo.slice(1));

            // Fora da faixa o fromCodePoint lanca e derrubaria a leitura da conversa inteira.
            return Number.isInteger(numero) && numero >= 0 && numero <= 0x10FFFF
                ? String.fromCodePoint(numero)
                : achado;
        }

        // Nome fora da tabela fica como veio: exibir "&oacute;" erra menos que adivinhar o caractere.
        return ENTIDADES_HTML[codigo.toLowerCase()] ?? achado;
    });

    return semEntidades
        // Espaco no fim da linha sobra do HTML indentado e apareceria no pre-wrap.
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

// Pool de concorrencia generico: "quantos" workers (limitados por iLimite) disputam trabalho
// chamando "trabalhador" repetidas vezes ate o chamador decidir que acabou (o proprio
// trabalhador controla o fim, tipicamente consumindo de um indice/fila compartilhados).
// Nasceu dentro do handler ChamadosSap, que saiu daqui; hoje e o pool das duas varreduras que
// sobraram - ChamadosComMensagemNova (interacao por chamado) e ClientesDistintosChamados
// (BusinessPartnerCollection por lote). Cada chamador passa o SEU teto no iLimite, porque os
// limites de 429 da ALM e do C4C sao independentes (SAP_LOTES_SIMULTANEOS x ..._CLIENTES).
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

// O cliente odata-v2 do CAP NAO converte data: CreatedOn chega como a string "/Date(1786125333406)/"
// e new Date() nela devolve Invalid Date (MEDIDO no tenant). Como as datas comparadas aqui vem de
// tres origens diferentes (C4C, HANA e ISO), tudo vira epoch em ms antes de qualquer comparacao.
// Mesma regex do frontend (_paraIsoLocal) pra nao haver dois entendimentos do mesmo formato.
function paraMs(vData) {
    if (vData === null || vData === undefined || vData === "") return null;
    if (vData instanceof Date) return Number.isNaN(vData.getTime()) ? null : vData.getTime();
    if (typeof vData === "number") return Number.isFinite(vData) ? vData : null;

    const aMatch = /\/Date\((-?\d+)/.exec(String(vData));
    const oData = aMatch ? new Date(Number(aMatch[1])) : new Date(String(vData));

    return Number.isNaN(oData.getTime()) ? null : oData.getTime();
}

// Maior de dois instantes tolerando null dos dois lados (chamado pode ter so uma das fontes).
function maiorOuNull(iA, iB) {
    if (iA === null || iA === undefined) return iB ?? null;
    if (iB === null || iB === undefined) return iA;
    return Math.max(iA, iB);
}

// Expira por TTL e, se ainda passar do teto, descarta as mais antigas (Map guarda a ordem de
// insercao): so o TTL nao seguraria um pico de chamados distintos no mesmo instante.
function limparCacheUltimaMensagem() {
    const iAgora = Date.now();

    for (const [sChave, oEntrada] of cacheUltimaMensagemPorChamado) {
        if (iAgora - oEntrada.quando >= TTL_CACHE_ULTIMA_MENSAGEM_MS) {
            cacheUltimaMensagemPorChamado.delete(sChave);
        }
    }

    while (cacheUltimaMensagemPorChamado.size > MAXIMO_ENTRADAS_CACHE_ULTIMA_MENSAGEM) {
        cacheUltimaMensagemPorChamado.delete(cacheUltimaMensagemPorChamado.keys().next().value);
    }
}

// Toda escrita passa por aqui para o teto valer de verdade: a limpeza avulsa roda uma vez por
// invocacao, ANTES do lote inserir, entao com chamadas concorrentes o Map passava do teto entre
// uma poda e outra.
function gravarCacheUltimaMensagem(sObjectID, iUltima) {
    cacheUltimaMensagemPorChamado.set(sObjectID, { quando: Date.now(), iUltima });
    limparCacheUltimaMensagem();
}

// Confere o TTL na leitura tambem: a limpeza roda uma vez por chamada e o lote pode demorar mais
// que a janela, o que serviria data vencida no fim da varredura.
function lerCacheUltimaMensagem(sObjectID) {
    const oEntrada = cacheUltimaMensagemPorChamado.get(sObjectID);
    if (!oEntrada) return null;

    if (Date.now() - oEntrada.quando >= TTL_CACHE_ULTIMA_MENSAGEM_MS) {
        cacheUltimaMensagemPorChamado.delete(sObjectID);
        return null;
    }

    return oEntrada;
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
                    "BusinessPartnerFormattedName",
                    // Liga na EmployeeOrganisationalUnitAssignmentCollection; fora do $select viria undefined.
                    "EmployeeID"
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

// Mesmo servico/EDMX do Employee, entao segue CQN - so muda a colecao, sem novo cds.connect.to.
// Nunca lanca: sem EmployeeID, sem atribuicao ou falha tecnica => false (menos privilegio).
async function funcionarioEhBasis(servico, employeeID) {
    const sEmployeeID = String(employeeID == null ? "" : employeeID).trim();
    if (!sEmployeeID) {
        LOG.warn("Funcionario sem EmployeeID: tratando como fora de BASIS.");
        return false;
    }

    try {
        const { EmployeeOrganisationalUnitAssignmentCollection } = servico.entities;
        const linhas = linhasDaResposta(await servico.run(
            SELECT.from(EmployeeOrganisationalUnitAssignmentCollection)
                .columns("OrgUnitID")
                .where({ EmployeeID: sEmployeeID })
        ));

        // Um EmployeeID tem varias linhas (vigencia e papeis) e basta UMA bater; OrgUnitID e
        // FixedLength no C4C, entao vem padded - trim antes do toUpperCase.
        return linhas.some((linha) => ORG_UNITS_BASIS.has(
            String((linha && linha.OrgUnitID) || "").trim().toUpperCase()));
    } catch (erro) {
        LOG.warn(
            `Falha ao consultar EmployeeOrganisationalUnitAssignmentCollection para o ` +
            `EmployeeID ${sEmployeeID}; tratando como fora de BASIS: ${erro.message}`
        );
        return false;
    }
}

// GET unico da lista e do detalhe: evita as duas divergirem se path/reporter mudarem. Nao trata erro.
async function lerCasoSapCru(calmItsmService, correlationId, sUser) {
    const parametros = new URLSearchParams({ id: correlationId, reporter: sUser });

    return calmItsmService.send({
        method: "GET",
        path: `/supportcases/cases?${parametros}`
    });
}

// ALM manda "" e nao null: String(x ?? "") preserva o vazio e evita "undefined" na tela.
function casoSapDetalhadoComoResposta(caso, correlationId) {
    const texto = (valor) => String(valor ?? "");

    return {
        // || e nao ??: id vazio passaria pelo ?? e a tela perderia a chave que pediu.
        correlationId: texto(caso.id) || correlationId,
        caseNumber: texto(caso.caseNumber),
        subject: texto(caso.subject),
        description: texto(caso.description),
        businessImpact: texto(caso.businessImpact),
        priority: texto(caso.priority),
        status: texto(caso.status),
        product: texto(caso.product),
        productFunction: texto(caso.productFunction),
        customer: texto(caso.customer),
        customerNumber: texto(caso.customerNumber),
        reporter: texto(caso.reporter),
        systemName: texto(caso.systemName),
        systemId: texto(caso.systemId),
        systemNbr: texto(caso.systemNbr),
        installationNumber: texto(caso.installationNumber),
        supportType: texto(caso.supportType),
        language: texto(caso.language),
        connectionLink: texto(caso.connectionLink),
        createdAt: texto(caso.createdAt),
        updatedAt: texto(caso.updatedAt),
        closedAt: texto(caso.closedAt),
        createdBy: texto(caso.createdBy),
        lastUpdatedBy: texto(caso.lastUpdatedBy)
    };
}

// caseNumber e subject so existem no GET de detalhe, um por caso. Compartilhada pelo dialogo e
// pela tela para as duas nao divergirem. Nunca lanca: caso ilegivel sai da lista com warn.
async function lerDetalhesCasosSap(calmItsmService, correlacoes, sUser, contexto) {
    // Posicao fixa: os detalhes voltam fora de ordem no paralelo e a tela lista na ordem da ALM.
    const detalhes = new Array(correlacoes.length).fill(null);
    let proximo = 0;

    const lerDetalhe = async () => {
        while (proximo < correlacoes.length) {
            const indice = proximo;
            proximo += 1;
            const correlationId = correlacoes[indice];

            try {
                const caso = await lerCasoSapCru(calmItsmService, correlationId, sUser);

                // Case vem sem envelope results; campo vazio e dado valido, e o placeholder fica
                // na tela para o backend nao inventar numero de caso.
                detalhes[indice] = {
                    correlationId,
                    caseNumber: String(caso?.caseNumber ?? ""),
                    subject: String(caso?.subject ?? "")
                };
            } catch (erro) {
                // Um caso ilegivel nao pode esconder os demais da lista.
                LOG.warn(`Falha ao ler o detalhe do caso ${correlationId} (${contexto}, `
                    + `S-User ${sUser}): ${erro.message}`);

                if (Number(erro?.status ?? erro?.statusCode ?? 0) === 429) {
                    LOG.warn(`Rate limit da ALM atingido com ${DETALHES_SIMULTANEOS_CASOS_SAP} `
                        + "detalhes simultaneos de casos.");
                }
            }
        }
    };

    const trabalhadores = Math.max(1,
        Math.min(DETALHES_SIMULTANEOS_CASOS_SAP, correlacoes.length));

    await Promise.all(Array.from({ length: trabalhadores }, lerDetalhe));

    return detalhes;
}

// Um id ou cinquenta: so o $filter muda, entao a consulta unitaria e a do lote sao a MESMA para
// nao divergirem no dia em que o tenant mudar de campo. Nao trata erro: quem chama decide.
async function consultarClientesSap(servico, ids) {
    // Literal string em OData V2: aspas simples no valor escapam dobrando.
    const filtro = ids
        .map((id) => `BusinessPartnerID eq '${id.replace(/'/g, "''")}'`)
        .join(" or ");

    // $format=json + Accept trocam o XML default do C4C; linhasDaResposta desembrulha o
    // {d:{results}}. encodeURIComponent so no valor: no path inteiro mataria o ? e o &.
    const linhas = linhasDaResposta(await servico.send({
        method: "GET",
        path: `/BusinessPartnerCollection?$filter=${encodeURIComponent(filtro)}`
            + `&$expand=CorporateAccount&$format=json`,
        headers: { Accept: "application/json" }
    }));

    return linhas.filter(Boolean).map((linha) => {
        // Reaproveita o desembrulho: nav to-one expandida vem como objeto, mas o tenant pode
        // declarar to-many ({results:[...]}) ou ignorar o $expand ({__deferred}).
        const conta = linhasDaResposta(linha.CorporateAccount)[0] || {};

        // .trim() e teste de string vazia, nao verdade do objeto: campo em branco no C4C chega
        // como "" e passaria pelo ??.
        const doParceiro = String(linha.z_customer_number_KUT ?? "").trim();
        const nomeDoParceiro = String(linha.BusinessPartnerFormattedName ?? "").trim();

        return {
            businessPartnerId: String(linha.BusinessPartnerID ?? "").trim(),
            customerNumber: doParceiro || String(conta.z_customer_number_KUT ?? "").trim(),
            nome: nomeDoParceiro || String(conta.BusinessPartnerFormattedName ?? "").trim(),
            falha: false
        };
    });
}

// Por ContactID ou por Name so o filtro muda; nao trata erro para quem chama escolher 502 ou fallback.
async function lerContatosC4C(servico, filtro) {
    const { ContactCollection } = servico.entities;

    return linhasDaResposta(await servico.run(
        SELECT.from(ContactCollection)
            .columns("ContactID", "Name", "Email")
            .where(filtro)
    ));
}

// Pagina do endpoint contacts, comum as duas varreduras. Nao trata erro: quem chama traduz para 502.
async function lerPaginaContatosSap(calmItsmService, customerNumber, lidos, filtros = {}) {
    const parametros = new URLSearchParams({
        customerNumber,
        ...filtros,
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

    return { linhas, total: Number(resposta?.totalCount ?? linhas.length) };
}

// Devolve lidos/total junto com o contato porque varredura truncada e cadastro inexistente dao
// o mesmo 404 na tela e so o log separa os dois. Nao trata erro: quem chama traduz para 502.
async function varrerContatosSap(calmItsmService, email, customerNumber) {
    let pessoa = null;
    let lidos = 0;
    let total = 0;
    let primeiroDaPaginaAnterior = "";

    for (let pagina = 0; pagina < MAXIMO_PAGINAS_CONTATOS_SAP; pagina += 1) {
        const { linhas, total: totalDaPagina } = await lerPaginaContatosSap(
            calmItsmService, customerNumber, lidos, { email });

        total = totalDaPagina;
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

// Lista inteira de S-Users do customer para a ajuda de valor; devolve os totais junto porque so
// eles distinguem lista completa de varredura truncada. Nao trata erro: quem chama traduz para 502.
async function varrerTodosContatosSap(calmItsmService, customerNumber) {
    const pessoas = [];
    const vistos = new Set();
    let lidos = 0;
    let total = 0;
    let primeiroDaPaginaAnterior = "";

    for (let pagina = 0; pagina < MAXIMO_PAGINAS_CONTATOS_SAP; pagina += 1) {
        const { linhas, total: totalDaPagina } = await lerPaginaContatosSap(
            calmItsmService, customerNumber, lidos);

        total = totalDaPagina;
        lidos += linhas.length;

        for (const linha of linhas) {
            // O mesmo S-User volta uma vez por authorization object e sairia repetido na lista.
            const chave = String(linha?.suser ?? "").trim().toUpperCase();

            if (!chave || vistos.has(chave)) continue;

            vistos.add(chave);
            pessoas.push(linha);
        }

        // API que ignorasse o offset devolveria a mesma pagina ate estourar o rate limit.
        const primeiro = String(linhas[0]?.suser ?? "");
        const paginaRepetida = Boolean(primeiro) && primeiro === primeiroDaPaginaAnterior;
        primeiroDaPaginaAnterior = primeiro;

        if (!linhas.length || paginaRepetida || lidos >= total) break;
    }

    return { pessoas, lidos, total };
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
    // c4codataapi sem model: BusinessPartnerCollection nao esta em nenhum EDMX importado, entao
    // o z_customer_number_KUT so e alcancavel por send() cru.
    const c4cService = await cds.connect.to("c4c");
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
        const email = resolverEmailDoRequisitante(req);

        // Sem identidade nenhuma o EMailURI vazio faria a ContactQueryByElements devolver a
        // primeira linha do tenant e o app assumiria o contato de outra pessoa. Resposta neutra:
        // o frontend ja bloqueia a tela quando origem vem vazia.
        if (!email) {
            LOG.warn("Requisitante sem e-mail utilizavel (JWT sem attr.email e nada informado): "
                + "devolvendo requisitante vazio.");
            return { nome: "", contatoId: "", clientes: [], origem: "", basis: false };
        }

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
            if (!funcionario) {
                return { nome: "", contatoId: "", clientes: [], origem: "", basis: false };
            }

            // Segunda consulta e nao expand: o escopo da lista NAO muda com o basis, ele so decide
            // o que a UI mostra - por isso nao rejeita nem bloqueia quando a consulta falha.
            const ehBasis = await funcionarioEhBasis(employeeAndUserService, funcionario.EmployeeID);

            // BusinessPartnerID e o identificador que o C4C aceita em BuyerMainContactPartyID;
            // vazio aqui = o frontend trata como "nao achou" e bloqueia a tela.
            return {
                nome: String(funcionario.BusinessPartnerFormattedName || "").trim(),
                contatoId: String(funcionario.BusinessPartnerID == null
                    ? "" : funcionario.BusinessPartnerID).trim(),
                clientes: [],
                origem: "funcionario",
                basis: ehBasis
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

        // basis e sempre false no contato: quem abre chamado nao opera o SAP.
        return { nome, contatoId, clientes, origem: "contato", basis: false };
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
        const sEmail = resolverEmailDoChat(req);

        // Sem identidade a consulta seria por usuario = "": nenhuma linha volta, todo chamado com
        // conversa cai no ramo "nunca visualizado" e o sino acende em TUDO pra TODOS - o mesmo
        // sintoma que esta rodada foi corrigir, so que por outro caminho. Falha fechada: nao
        // notificar erra menos que notificar tudo, e MarcarChatVisualizado nem conseguiria apagar.
        if (!sEmail) {
            LOG.warn("Sem identidade para o badge de chat (JWT sem attr.email e sem e-mail no "
                + "request): notificacao desligada nesta chamada.");
            return { ticketIds: [], chamados: [] };
        }

        const aChamados = Array.isArray(req.data.chamados) ? req.data.chamados : [];
        if (!aChamados.length) {
            return { ticketIds: [], chamados: [] };
        }

        // O HANA deste plano free desliga sozinho todos os dias: sem o try/catch, o poll de 60 s
        // do frontend viraria uma sequencia de 500 mudos. Degradar = "ninguem tem mensagem nova".
        let mVisualizadoEm;
        let bJaSemeado;
        let iPisoBadge;
        try {
            const aVisualizacoes = await dbService.run(
                SELECT.from(CHAT_VISUALIZACOES).where({ usuario: sEmail })
            );
            mVisualizadoEm = new Map(aVisualizacoes.map((oLinha) => [
                String(oLinha.ticketId || "").trim(),
                paraMs(oLinha.visualizadoEm)
            ]));

            // O marco nao e chamado nenhum: sai do mapa para nunca ser comparado com um ticketId
            // real. A EXISTENCIA dele diz se o usuario ja foi semeado; a data e o piso do badge.
            bJaSemeado = mVisualizadoEm.has(TICKET_ID_MARCO_SEMEADURA);
            iPisoBadge = mVisualizadoEm.get(TICKET_ID_MARCO_SEMEADURA) ?? null;
            mVisualizadoEm.delete(TICKET_ID_MARCO_SEMEADURA);
        } catch (erro) {
            LOG.warn(`Falha ao ler ChatVisualizacoes de ${sEmail}: ${erro.message}`);
            return { ticketIds: [], chamados: [] };
        }

        // Todo chamado com objectID e candidato. O atalho antigo ("nunca visualizado = notifica
        // direto, sem gastar chamada") era o bug do primeiro acesso: chamado recem-aberto, que so
        // tem a descricao (TypeCode 10004) e ZERO mensagem, acendia badge pra todo mundo. Agora
        // os dois ramos respondem a MESMA pergunta com a MESMA consulta: qual a data da ultima
        // mensagem. Chamado sem objectID fica de fora (nao da pra consultar) e nem entra na lista.
        const aElegiveis = aChamados
            .map((oChamado) => ({
                ticketId: String(oChamado.ticketId || "").trim(),
                objectID: String(oChamado.objectID || "").trim()
            }))
            .filter((oCand) => oCand.ticketId && oCand.objectID);

        // Corte defensivo na ordem recebida (o frontend manda do mais recente): cliente
        // desatualizado nao estoura o tenant, e o LOG.warn evita truncamento silencioso.
        if (aElegiveis.length > MAXIMO_CHAMADOS_POLL_NOTIFICACOES) {
            LOG.warn(`Poll de notificacoes recebeu ${aElegiveis.length} chamados de ${sEmail}, `
                + `acima do teto ${MAXIMO_CHAMADOS_POLL_NOTIFICACOES}: lote truncado. `
                + "Conferir o corte do frontend (MAX_CHAMADOS_POLL_NOTIFICACOES).");
        }

        const aCandidatos = aElegiveis.slice(0, MAXIMO_CHAMADOS_POLL_NOTIFICACOES);

        // Sem o marco = primeiro acesso do usuario: grava o piso e nao notifica nada nesta rodada,
        // para o sino nao saltar de zero para a lista inteira (as linhas antigas ficaram orfas
        // quando a chave passou a ser o e-mail real). E POR USUARIO, uma vez so: por chamado,
        // resposta chegada com o app fechado nunca mais viraria badge.
        // Grava UMA linha (o marco) e nao uma por chamado do lote de proposito: o piso vale para
        // TODOS os chamados do usuario, inclusive os que nao couberam nos 30 desta rodada - com
        // semeadura por lote, os chamados 31+ acenderiam todos juntos no dia em que entrassem.
        // visualizadoEm vai EXPLICITO em vez de depender de @cds.on.insert: e o mesmo instante
        // que a anotacao gravaria, e linha com data nula seria lida como "nunca visualizado", que
        // e o pior default possivel aqui.
        if (!bJaSemeado) {
            let bSemeadoAgora = false;

            try {
                await dbService.run(UPSERT.into(CHAT_VISUALIZACOES).entries({
                    usuario: sEmail,
                    ticketId: TICKET_ID_MARCO_SEMEADURA,
                    visualizadoEm: new Date().toISOString()
                }));
                bSemeadoAgora = true;
                LOG.info(`Primeiro acesso do badge de chat de ${sEmail}: piso gravado, `
                    + "sem notificacao nesta rodada.");
            } catch (erro) {
                // NAO silencia quando a gravacao falha: sem o marco no banco, a proxima rodada
                // cairia aqui de novo, e uma falha DETERMINISTICA deixaria o sino desligado para
                // sempre, sem sintoma nenhum na tela. Segue para a avaliacao normal, que erra
                // para o lado visivel (notifica demais uma vez) e o usuario apaga abrindo o chat.
                LOG.error(`Falha ao semear o marco de ChatVisualizacoes de ${sEmail}: `
                    + `${erro.message}. Notificacao segue pelo caminho normal nesta rodada.`);
            }

            // ultimaMensagemEm nulo e ESCOLHA: 2 GETs por chamado para uma data que nao muda o
            // badge ("nao notifica" por definicao) seria o pior custo - a rodada seguinte a traz.
            if (bSemeadoAgora) {
                return {
                    ticketIds: [],
                    chamados: aCandidatos.map((oCand) => ({
                        ticketId: oCand.ticketId,
                        mensagemNova: false,
                        ultimaMensagemEm: null
                    }))
                };
            }
        }

        const aResultado = [];

        if (aCandidatos.length) {
            const sFiltroTypeCode = TYPE_CODES_MENSAGEM_CHAT
                .map((sTypeCode) => `TypeCode eq '${sTypeCode}'`)
                .join(" or ");

            // Reserva do REDE_SEGURANCA_LIGADA: a consulta LEGADA (filtro de data, sem $orderby)
            // so responde "existe algo depois de X", nunca "quando foi" - por isso ela nao entra
            // no caminho normal, so confirma o vazio antes de concluir "sem mensagem nenhuma".
            const temNotaDepoisDe = async (sObjectID, iVisualizadoEm, sTicketId) => {
                try {
                    const sData = new Date(iVisualizadoEm).toISOString();
                    const aNotas = linhasDaResposta(await ticketService.send({
                        method: "GET",
                        path: "/ServiceRequestTextCollectionCollection?$filter="
                            + encodeURIComponent(`(${sFiltroTypeCode}) and ParentObjectID eq '${sObjectID}' `
                                + `and CreatedOn gt datetimeoffset'${sData}'`)
                            + "&$top=1&$select=ParentObjectID&$format=json",
                        headers: { Accept: "application/json" }
                    }));
                    return aNotas.length > 0;
                } catch (erro) {
                    LOG.warn(`Falha na checagem legada do chamado ${sTicketId}: ${erro.message}`);
                    return false;
                }
            };

            // Cache por objectID: a data nao depende de quem pergunta, entao N usuarios com a
            // tela aberta pagam uma consulta so por janela em vez de N.
            const ultimaMensagemDoChamado = async (sChaveCache, sObjectID, sTicketId) => {
                const oEmCache = lerCacheUltimaMensagem(sChaveCache);
                if (oEmCache) return oEmCache.iUltima;

                let bConsultaCompleta = true;

                // Nota: TypeCode 10007/10008 (mesmo par que o app usa pra enviar mensagem).
                // A consulta agora e ORDENADA por CreatedOn desc + $top=1, sem filtro de
                // data: e o unico jeito de saber QUANDO foi a ultima mensagem (a lista de
                // chats mostra essa data no lugar da abertura). Sem $orderby o C4C devolve
                // uma ordem arbitraria - MEDIDO: num chamado de 4 notas, $top=1 sozinho
                // trouxe a TERCEIRA. O $orderby foi validado 20/20 vezes neste tenant.
                let iNota = null;
                try {
                    const aNotas = linhasDaResposta(await ticketService.send({
                        method: "GET",
                        path: "/ServiceRequestTextCollectionCollection?$filter="
                            + encodeURIComponent(`(${sFiltroTypeCode}) and ParentObjectID eq '${sObjectID}'`)
                            + "&$orderby=" + encodeURIComponent("CreatedOn desc")
                            + "&$top=1&$select=CreatedOn&$format=json",
                        headers: { Accept: "application/json" }
                    }));
                    if (aNotas.length) iNota = paraMs(aNotas[0].CreatedOn);
                } catch (erro) {
                    // Falha ISOLADA: so este chamado perde a fonte "nota" nesta rodada, os
                    // demais e o resultado geral seguem intactos.
                    bConsultaCompleta = false;
                    LOG.warn(`Falha ao ler a ultima nota do chamado ${sTicketId}: ${erro.message}`);
                }

                // Interacao: mensagem digitada direto no Sales Cloud, que NAO vira nota.
                // Consultada SEMPRE, nunca so quando a nota falta: MEDIDO que em 5 de 8
                // conversas com as duas fontes a interacao era MAIS NOVA que a nota (num caso
                // 2 dias depois). Parar na nota daria data errada e sino apagado.
                let iInteracao = null;
                try {
                    const aInteracoes = linhasDaResposta(await interactionService.send({
                        method: "GET",
                        path: `/ServiceRequestInteractionTicketCollection('${sObjectID}')`
                            + "/ServiceRequestInteractionInteractions?$orderby="
                            + encodeURIComponent("CreationDateTime desc")
                            + "&$top=" + TOPO_INTERACOES_COM_TEXTO
                            + "&$select=CreationDateTime,Text&$format=json",
                        headers: { Accept: "application/json" }
                    }));

                    // Text vazio NAO conta: o chat descarta essas linhas nos dois lados
                    // (InteracoesDoChamado aqui e _mapearInteracaoParaChat no frontend), e
                    // MEDIDO no tenant que a interacao MAIS NOVA de um chamado real tinha so
                    // assunto. Contar essa linha acenderia o sino e mandaria o usuario para
                    // uma conversa onde nao ha nada de novo - o mesmo tipo de badge falso que
                    // esta rodada foi corrigir. Por isso o $top pega algumas e fica na
                    // primeira COM texto, ja que a lista vem ordenada da mais nova.
                    const oInteracaoComTexto = aInteracoes
                        .find((oLinha) => String(oLinha.Text || "").trim());

                    if (oInteracaoComTexto) {
                        iInteracao = paraMs(oInteracaoComTexto.CreationDateTime);
                    }
                } catch (erro) {
                    bConsultaCompleta = false;
                    LOG.warn(`Falha ao ler a ultima interacao do chamado ${sTicketId}: ${erro.message}`);
                }

                const iUltima = maiorOuNull(iNota, iInteracao);

                // Resultado PARCIAL nunca entra no cache: uma instabilidade de 1 s viraria
                // "sem mensagem" por 30 s, apagando o badge de todos os usuarios.
                if (bConsultaCompleta) {
                    gravarCacheUltimaMensagem(sChaveCache, iUltima);
                }

                return iUltima;
            };

            limparCacheUltimaMensagem();

            let iProximo = 0;

            // Um chamado de cada vez (nunca em lote): tentei um filtro OR de ParentObjectID pra
            // checar todos numa chamada so, mas MEDIDO contra o tenant que o parser do C4C e
            // instavel com OR de 2+ valores - as vezes devolve VAZIO sem erro (silenciosamente
            // ignorando candidatos validos, o mesmo tipo de bug que reverteu a tentativa
            // anterior) e as vezes rejeita com "Ungultigen Token". So a checagem POR CHAMADO
            // (uma unica igualdade no filtro, sem OR nenhum) se mostrou estavel. O paralelismo
            // usa o mesmo teto de 429 do C4C que as demais varreduras.
            await emParalelo(LOTES_SIMULTANEOS_CHAMADOS_SAP, aCandidatos.length, async () => {
                while (iProximo < aCandidatos.length) {
                    const oCand = aCandidatos[iProximo];
                    iProximo += 1;

                    const sObjectID = oCand.objectID.replace(/'/g, "''");
                    const bTemLinha = mVisualizadoEm.has(oCand.ticketId);
                    const iVisualizadoEm = mVisualizadoEm.get(oCand.ticketId) ?? null;

                    // A decisao continua POR USUARIO aqui embaixo: o cache guarda a data, nunca
                    // o mensagemNova, que depende do visualizadoEm de cada um.
                    const iUltima = await ultimaMensagemDoChamado(
                        oCand.objectID, sObjectID, oCand.ticketId
                    );

                    let bMensagemNova;
                    let sUltimaMensagemEm;

                    if (iUltima !== null) {
                        if (iVisualizadoEm !== null) {
                            bMensagemNova = iUltima > iVisualizadoEm;
                        } else if (bTemLinha) {
                            // Linha existe mas sem data (gravacao antiga ou interrompida): nao ha
                            // com o que comparar. Fail closed, igual ao resto do handler - ler
                            // isso como "nunca visualizado" acenderia a lista toda de uma vez.
                            bMensagemNova = false;
                        } else if (iPisoBadge !== null) {
                            // Chamado SEM linha propria: compara com o piso da semeadura, nao com
                            // "nunca visualizado". E o que faz o silenciamento do primeiro acesso
                            // valer para os chamados que nao couberam no primeiro lote, sem calar
                            // mensagem que chegou DEPOIS do piso (essa continua acendendo).
                            bMensagemNova = iUltima > iPisoBadge;
                        } else {
                            // Sem piso: usuario cujo marco nao pode ser gravado nesta rodada.
                            // Comportamento anterior a esta rodada (notifica), de proposito - ver
                            // o LOG.error da semeadura.
                            bMensagemNova = true;
                        }

                        sUltimaMensagemEm = new Date(iUltima).toISOString();
                    } else {
                        // Sem mensagem nenhuma: chamado recem-aberto NAO notifica.
                        bMensagemNova = false;
                        sUltimaMensagemEm = null;

                        // A rede de seguranca so existe porque "vazio" tambem e o sintoma do
                        // parser instavel. Sem visualizadoEm nao ha consulta legada possivel (ela
                        // precisa da data), e esse e o caso da maioria dos chamados - por isso a
                        // reserva quase nunca roda. Quando roda, sabe-se SE ha mensagem nova, mas
                        // nao QUANDO: unico caso em que mensagemNova=true com data nula.
                        if (REDE_SEGURANCA_LIGADA && iVisualizadoEm !== null) {
                            bMensagemNova = await temNotaDepoisDe(sObjectID, iVisualizadoEm, oCand.ticketId);
                        }
                    }

                    aResultado.push({
                        ticketId: oCand.ticketId,
                        mensagemNova: bMensagemNova,
                        ultimaMensagemEm: sUltimaMensagemEm
                    });
                }
            });
        }

        // ticketIds e SEMPRE derivado de chamados (nunca calculado por outro caminho): e o unico
        // campo que a versao anterior do frontend le, e os dois lados precisam poder subir em
        // deploys separados sem divergir.
        return {
            ticketIds: aResultado.filter((oItem) => oItem.mensagemNova).map((oItem) => oItem.ticketId),
            chamados: aResultado
        };
    });

    this.on("MarcarChatVisualizado", async (req) => {
        // Mesmo helper da leitura: a chave (usuario, ticketId) so fecha se os dois lados
        // normalizarem igual - gravar "Fulano@x" e ler "fulano@x" criaria duas linhas.
        const email = resolverEmailDoChat(req);
        const ticketId = String(req.data.ticketId || "").trim();

        if (!ticketId) {
            return req.reject(400, "ticketId é obrigatório.");
        }

        // Identidade ausente e caso SEPARADO do ticketId: rejeitar com a mensagem do ticketId
        // mandava o suporte investigar o frontend quando o furo estava no xsuaa. E devolver false
        // em vez de 400 mantem o padrao "marcar visualizado e acessorio, nao derruba o envio".
        if (!email) {
            LOG.warn(`Sem identidade para marcar o chat ${ticketId} como visualizado `
                + "(JWT sem attr.email e sem e-mail no request).");
            return false;
        }

        // Marcar visualizado e acessorio: se o HANA free estiver dormindo, o badge continua aceso
        // (custo baixo) em vez de o frontend tomar 500 no meio do envio de uma mensagem.
        try {
            await dbService.run(UPSERT.into(CHAT_VISUALIZACOES).entries({ usuario: email, ticketId }));
        } catch (erro) {
            LOG.warn(`Falha ao gravar ChatVisualizacoes de ${email} / ${ticketId}: ${erro.message}`);
            return false;
        }

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

    this.on("AtualizarComponenteChamado", async (req) => {
        const objectID = String(req.data.objectID || "").trim();
        // Componente vazio e troca valida (limpar o campo no header), por isso nao curto-circuita.
        const componenteId = String(req.data.componenteId || "").trim();
        // Roda depois do chamado aberto: rejeitar faria a tela culpar o fluxo principal.
        const semGravar = (mensagem) => {
            LOG.warn(mensagem);
            return { atualizado: false, componenteId: "", falha: true, mensagem };
        };

        if (!objectID) return semGravar("ObjectID do chamado nao informado.");

        if (componenteId.length > TAMANHO_MAXIMO_COMPONENTE_SAP) {
            return semGravar(`Componente SAP acima de ${TAMANHO_MAXIMO_COMPONENTE_SAP} caracteres.`);
        }

        const { ServiceRequestCollection } = ticketService.entities;

        try {
            // Mantem a whitelist de status do handler UPDATE intacta; o CQN resolve key e CSRF.
            await ticketService.run(
                UPDATE(ServiceRequestCollection)
                    .where({ ObjectID: objectID })
                    .with({ Z_COMPONENT_SFM_KUT: componenteId })
            );
        } catch (erro) {
            LOG.warn(`Falha ao atualizar o componente SAP do chamado ${objectID}: ${erro.message}`);
            return { atualizado: false, componenteId: "", falha: true, mensagem: erro.message };
        }

        return { atualizado: true, componenteId, falha: false, mensagem: "" };
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

    // Requisitante do chamado, nao usuario logado: ALM cobra e-mail, e resolver aqui poupa roundtrip.
    this.on("ContatoSapDoRequisitante", async (req) => {
        const contatoId = String(req.data.contatoId || "").trim();
        const nome = String(req.data.nome || "").trim();

        if (!contatoId && !nome) {
            return req.reject(400,
                "Informe o contato ou o nome do requisitante para localizar o S-User no SAP Cloud ALM.");
        }

        let email = "";
        let buscadoPor = `contato ${contatoId}`;

        if (contatoId) {
            let porChave;
            try {
                porChave = await lerContatosC4C(contactService, { ContactID: contatoId });
            } catch (erro) {
                LOG.warn(`Falha ao consultar a ContactCollection pelo contato ${contatoId}: `
                    + `${erro.message}`);
                return req.reject(502,
                    `Nao foi possivel consultar o contato ${contatoId} no C4C: ${erro.message}`);
            }

            // ContactID e FixedLength(10) e BuyerMainContactPartyID e String(60): comparar cru
            // descartaria a linha certa quando o C4C devolve o id com zeros a esquerda.
            const semZeros = (valor) => String(valor || "").trim().replace(/^0+/, "");
            const chaveNormalizada = semZeros(contatoId);

            // C4C pode ignorar o $filter e a ordem nao e contratual: confere o ID e desempata local.
            const doContato = porChave
                .filter((linha) => linha
                    && String(linha.ContactID || "").trim()
                    && semZeros(linha.ContactID) === chaveNormalizada
                    && String(linha.Email || "").trim())
                .sort((a, b) => String(a.Email || "").localeCompare(String(b.Email || "")));

            if (doContato.length > 1) {
                LOG.warn(`${doContato.length} contatos com e-mail para o ContactID ${contatoId} `
                    + `no C4C; usando o primeiro (ordem nao contratual).`);
            }

            email = String(doContato[0]?.Email ?? "").trim().toLowerCase();

            // Funcionario manda BusinessPartnerID aqui: sem log, a chave nunca resolveria calada.
            if (!email) {
                LOG.warn(`ContactID ${contatoId} sem e-mail utilizavel no C4C `
                    + `(${porChave.length} linhas); ${nome ? `caindo no nome ${nome}.` : "sem nome para fallback."}`);
            }
        }

        // 404 e nao 502 porque isso e cadastro: chave sem e-mail e sem nome nao tem mais rota.
        if (!email && !nome) {
            return req.reject(404, `Nenhum e-mail encontrado no C4C para o contato ${contatoId}.`);
        }

        if (!email) {
            buscadoPor = `requisitante ${nome}`;

            let contatos;
            try {
                contatos = await lerContatosC4C(contactService, { Name: nome });
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

            email = String(comEmail[0]?.Email ?? "").trim().toLowerCase();

            if (!email) {
                // Sem e-mail nao ha como consultar a ALM; 404 e nao 502 porque isso e cadastro.
                LOG.warn(`Requisitante ${nome} sem e-mail utilizavel no C4C `
                    + `(${contatos.length} contatos com esse nome).`);

                return req.reject(404, `Nenhum e-mail encontrado no C4C para o requisitante ${nome}.`);
            }
        }

        let varredura;
        try {
            varredura = await varrerContatosSap(await conectarCalmItsm(), email, CUSTOMER_NUMBER_SAP);
        } catch (erro) {
            LOG.warn(`Falha ao ler contatos do SAP Cloud ALM para ${buscadoPor} (${email}): `
                + `${erro.message}`);
            return req.reject(502,
                `Nao foi possivel consultar os contatos do SAP Cloud ALM: ${erro.message}`);
        }

        if (!varredura.pessoa) {
            if (varredura.lidos < varredura.total) {
                LOG.warn(`Contatos lidos parcialmente (${varredura.lidos}/${varredura.total}) `
                    + `ao procurar ${email} no customer ${CUSTOMER_NUMBER_SAP}.`);
            }

            return req.reject(404, `Nenhum S-User encontrado para o ${buscadoPor} `
                + `(${email}) no customer ${CUSTOMER_NUMBER_SAP}.`);
        }

        return contatoSapComoResposta(varredura.pessoa);
    });

    // S-Users do cliente do chamado (z_customer_number_KUT, resolvido por ClienteSap) para a
    // ajuda de valor do dialogo de abertura.
    this.on("ContatosSap", async (req) => {
        const customerNumber = String(req.data.customerNumber || "").trim();

        // Sem fallback para CUSTOMER_NUMBER_SAP, ao contrario de AmbientesSap: aqui o customer
        // errado vazaria os contatos de outro cliente na tela.
        if (!customerNumber) {
            return req.reject(400,
                "Informe o numero do cliente para listar os S-Users do SAP Cloud ALM.");
        }

        let varredura;
        try {
            varredura = await varrerTodosContatosSap(await conectarCalmItsm(), customerNumber);
        } catch (erro) {
            LOG.warn(`Falha ao ler contatos do SAP Cloud ALM para o customer ${customerNumber}: `
                + `${erro.message}`);
            return req.reject(502,
                `Nao foi possivel consultar os contatos do SAP Cloud ALM: ${erro.message}`);
        }

        // Ordem estavel: a ALM nao a garante e a lista pularia de posicao entre aberturas.
        const contatos = varredura.pessoas
            .map((pessoa) => contatoSapComoResposta(pessoa))
            .sort((a, b) => a.nome.localeCompare(b.nome) || a.sUser.localeCompare(b.sUser));

        if (!contatos.length) {
            // Cliente sem S-User cadastrado e cadastro, nao falha: a tela recebe lista vazia.
            LOG.warn(`SAP Cloud ALM nao devolveu contatos para o customer ${customerNumber}.`);
        }

        // Lista incompleta sai com 200 e a tela nao tem como saber: sem este log o usuario que nao
        // acha o contato dele parece cadastro faltando.
        if (varredura.lidos < varredura.total) {
            LOG.warn(`Contatos lidos parcialmente (${varredura.lidos}/${varredura.total}) `
                + `no customer ${customerNumber}; a lista da tela esta truncada.`);
        }

        return {
            total: varredura.total || varredura.lidos,
            exibidos: contatos.length,
            contatos
        };
    });

    // Numero do cliente da ALM a partir do BuyerPartyID do chamado. Aditivo: falha tecnica ou
    // parceiro sem o campo devolve strings vazias, nunca derruba o dialogo de abertura.
    this.on("ClienteSap", async (req) => {
        const businessPartnerId = String(req.data.businessPartnerId || "").trim();
        const vazio = { businessPartnerId, customerNumber: "", nome: "", falha: false };

        if (!businessPartnerId) return vazio;

        let clientes;
        try {
            clientes = await consultarClientesSap(c4cService, [businessPartnerId]);
        } catch (erro) {
            LOG.warn(`Falha ao consultar BusinessPartnerCollection do parceiro `
                + `${businessPartnerId}: ${erro.message}`);

            // falha: true evita a tela acusar cadastro quando quem caiu foi o C4C.
            return { ...vazio, falha: true };
        }

        if (clientes.length > 1) {
            // Ordem do C4C nao e contratual: com mais de um parceiro a escolha e arbitraria.
            LOG.warn(`${clientes.length} parceiros para o BusinessPartnerID ${businessPartnerId}; `
                + `usando o primeiro da resposta.`);
        }

        return clientes[0] || vazio;
    });

    // Lote da carga da lista de chamados: os ids chegam separados por virgula porque function
    // com parametro de colecao viraria uma URL bem mais fragil no V4.
    this.on("ClientesSap", async (req) => {
        const ids = [...new Set(String(req.data.businessPartnerIds || "")
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean))];

        if (!ids.length) return { falha: false, clientes: [] };

        const lote = ids.slice(0, MAXIMO_PARCEIROS_POR_LOTE_SAP);

        if (lote.length < ids.length) {
            // Truncar calado faria a tela achar que os chamados de fora nao tem cliente.
            LOG.warn(`${ids.length} parceiros pedidos e o teto por lote e `
                + `${MAXIMO_PARCEIROS_POR_LOTE_SAP}; ${ids.length - lote.length} ficaram sem numero.`);
        }

        try {
            return { falha: false, clientes: await consultarClientesSap(c4cService, lote) };
        } catch (erro) {
            LOG.warn(`Falha ao consultar BusinessPartnerCollection do lote de `
                + `${lote.length} parceiros: ${erro.message}`);

            return { falha: true, clientes: [] };
        }
    });

    // cases/ids so devolve correlationId: caseNumber e subject exigem um GET de detalhe por caso.
    this.on("CasosSapDoRequisitante", async (req) => {
        const customerNumber = String(req.data.customerNumber || "").trim();
        const sUser = String(req.data.sUser || "").trim();

        // Os dois dados chegam de consultas assincronas da tela: faltar um e estado normal de
        // carregamento, e sem escopo completo cases/ids vazaria case de outro cliente.
        if (!customerNumber || !sUser) {
            // debug e nao warn: a tela ja guarda contra isso, entao aqui e chamada direta.
            LOG.debug("Casos SAP do requisitante sem escopo completo "
                + `(cliente "${customerNumber}", S-User "${sUser}"): lista volta vazia.`);
            return { total: 0, exibidos: 0, truncado: false, casos: [] };
        }

        const inicio = Date.now();

        let calmItsmService;
        let resposta;
        try {
            calmItsmService = await conectarCalmItsm();

            // limit explicito: sem ele vale o default do servidor (nao documentado no spec) e a
            // contagem exibida na tela seria a da pagina, nao a do cliente.
            const parametros = new URLSearchParams({
                reporter: sUser,
                limit: String(LIMITE_CHAMADOS_SAP)
            });
            // append porque customerNumber e array no spec: virgula viraria cliente inexistente.
            parametros.append("customerNumber", customerNumber);

            resposta = await calmItsmService.send({
                method: "GET",
                path: `/supportcases/cases/ids?${parametros}`
            });
        } catch (erro) {
            LOG.warn(`Falha ao ler casos do cliente ${customerNumber} (S-User ${sUser}) `
                + `no SAP Cloud ALM: ${erro.message}`);
            return req.reject(502,
                `Nao foi possivel consultar os casos do SAP Cloud ALM: ${erro.message}`);
        }

        const linhas = Array.isArray(resposta?.results) ? resposta.results : [];

        const correlacoes = [];
        const vistas = new Set();

        for (const linha of linhas) {
            const correlationId = String(linha?.correlationId ?? "").trim();
            // O mesmo case repete quando o cliente aparece em mais de uma hierarquia VAR.
            if (!correlationId || vistas.has(correlationId)) continue;
            vistas.add(correlationId);
            correlacoes.push(correlationId);
        }

        // Uma passada so: se a ALM cortou a resposta, o totalCount dela e a unica contagem
        // honesta - o distinto local so vale quando ela devolveu tudo que tinha.
        const totalDaAlm = Number(resposta?.totalCount ?? linhas.length);
        const total = totalDaAlm > linhas.length ? totalDaAlm : correlacoes.length;

        if (totalDaAlm > linhas.length) {
            LOG.warn(`SAP Cloud ALM informou ${totalDaAlm} casos do cliente ${customerNumber} `
                + `e devolveu ${linhas.length} na leitura unica de cases/ids.`);
        }

        // Separado de exibidos: detalhe que falha tambem reduz a lista, e so este flag diz que
        // faltou caso por teto - o aviso de truncado na tela depende dele.
        const truncado = correlacoes.length > MAXIMO_DETALHES_CASOS_SAP || total > correlacoes.length;

        if (correlacoes.length > MAXIMO_DETALHES_CASOS_SAP) {
            LOG.warn(`Cliente ${customerNumber} tem ${total} casos; a tela mostra so os primeiros `
                + `${MAXIMO_DETALHES_CASOS_SAP} (teto do GET de detalhe).`);
            correlacoes.length = MAXIMO_DETALHES_CASOS_SAP;
        }

        const detalhes = await lerDetalhesCasosSap(calmItsmService, correlacoes, sUser,
            `cliente ${customerNumber}`);

        const casos = detalhes.filter(Boolean);

        LOG.info(`Casos SAP do cliente ${customerNumber} (S-User ${sUser}): ${total} correlacoes, `
            + `${casos.length} detalhes lidos em ${Date.now() - inicio} ms.`);

        return { total, exibidos: casos.length, truncado, casos };
    });

    // Tela SAP: os clientes saem dos proprios chamados do requisitante, nao do master data da ALM,
    // entao a lista fica restrita a quem ele realmente atende.
    this.on("CasosSapDosChamados", async (req) => {
        const contatoId = String(req.data.contatoId || "").trim();
        const sUser = String(req.data.sUser || "").trim();
        const vazio = { clientes: 0, total: 0, exibidos: 0, truncado: false, falha: false, casos: [] };

        if (!contatoId) {
            return req.reject(400,
                "Informe o contatoId do requisitante para levantar os casos dos chamados.");
        }

        // Sem reporter a ALM devolveria caso de outro usuario; vazio e melhor que consulta aberta.
        if (!sUser) {
            LOG.warn(`Casos SAP dos chamados de ${contatoId} sem S-User: lista volta vazia.`);
            return vazio;
        }

        const inicioTudo = Date.now();

        // Reusa a function em vez de duplicar a varredura: e ela que sabe ler ID + BuyerPartyID,
        // resolver o z_customer_number_KUT e cachear por 5 min.
        let distintos;
        try {
            distintos = await this.send("ClientesDistintosChamados", {
                contatoId,
                executor: req.data.executor === true,
                atualizar: req.data.atualizar === true
            });
        } catch (erro) {
            LOG.warn(`Falha ao levantar os clientes dos chamados de ${contatoId}: ${erro.message}`);
            return req.reject(502,
                `Nao foi possivel levantar os clientes dos chamados: ${erro.message}`);
        }

        const numeros = (distintos?.clientes ?? [])
            .map((cliente) => String(cliente?.customerNumber ?? "").trim())
            .filter(Boolean);

        if (!numeros.length) {
            // truncado/falha herdados: "nenhum caso" com varredura cortada nao e "nenhum caso".
            return {
                ...vazio,
                truncado: distintos?.truncado === true,
                falha: distintos?.falhaClientes === true
            };
        }

        let calmItsmService;
        try {
            calmItsmService = await conectarCalmItsm();
        } catch (erro) {
            LOG.warn(`Falha ao conectar no SAP Cloud ALM para os casos de ${contatoId}: ${erro.message}`);
            return req.reject(502, `Nao foi possivel conectar no SAP Cloud ALM: ${erro.message}`);
        }

        // Lotes de 5: acima disso o spec de cases/ids recusa a consulta.
        const lotes = [];
        for (let inicio = 0; inicio < numeros.length; inicio += MAXIMO_CLIENTES_POR_LOTE_SAP) {
            lotes.push(numeros.slice(inicio, inicio + MAXIMO_CLIENTES_POR_LOTE_SAP));
        }

        const clientePorCorrelacao = new Map();
        let falhaIds = false;

        for (const lote of lotes) {
            const parametros = new URLSearchParams({
                reporter: sUser,
                limit: String(LIMITE_CHAMADOS_SAP)
            });
            // append e nao join(","): virgula viraria um numero de cliente inexistente.
            for (const numero of lote) parametros.append("customerNumber", numero);

            try {
                const resposta = await calmItsmService.send({
                    method: "GET",
                    path: `/supportcases/cases/ids?${parametros}`
                });

                for (const linha of Array.isArray(resposta?.results) ? resposta.results : []) {
                    const correlationId = String(linha?.correlationId ?? "").trim();
                    if (!correlationId || clientePorCorrelacao.has(correlationId)) continue;

                    // O lote nao diz de qual dos 5 clientes veio o caso: o proprio payload diz.
                    clientePorCorrelacao.set(correlationId,
                        String(linha?.customerNumber ?? "").trim() || (lote.length === 1 ? lote[0] : ""));
                }
            } catch (erro) {
                // Lote que falha nao apaga os outros: a lista sai parcial e falha avisa a tela.
                falhaIds = true;
                LOG.warn(`Falha ao ler casos do lote [${lote.join(", ")}] (S-User ${sUser}): `
                    + erro.message);
            }
        }

        const correlacoes = [...clientePorCorrelacao.keys()];
        const total = correlacoes.length;
        const truncado = total > MAXIMO_DETALHES_CASOS_TELA_SAP || distintos?.truncado === true;

        if (total > MAXIMO_DETALHES_CASOS_TELA_SAP) {
            LOG.warn(`${total} casos nos ${numeros.length} clientes de ${contatoId}; a tela mostra `
                + `so os primeiros ${MAXIMO_DETALHES_CASOS_TELA_SAP} (teto do GET de detalhe).`);
            correlacoes.length = MAXIMO_DETALHES_CASOS_TELA_SAP;
        }

        const detalhes = await lerDetalhesCasosSap(calmItsmService, correlacoes, sUser,
            `${numeros.length} clientes de ${contatoId}`);

        const casos = detalhes.filter(Boolean).map((caso) => ({
            ...caso,
            customerNumber: clientePorCorrelacao.get(caso.correlationId) ?? ""
        }));

        LOG.info(`Casos SAP dos chamados de ${contatoId} (S-User ${sUser}): ${numeros.length} `
            + `clientes em ${lotes.length} lotes, ${total} casos, ${casos.length} detalhes lidos `
            + `em ${Date.now() - inicioTudo} ms.`);

        return {
            clientes: numeros.length,
            total,
            exibidos: casos.length,
            truncado,
            falha: falhaIds || distintos?.falhaClientes === true,
            casos
        };
    });

    // Detalhe de UM caso, no clique da linha: e o mesmo GET da lista, so que aproveitado inteiro.
    this.on("DetalheCasoSap", async (req) => {
        const correlationId = String(req.data.correlationId || "").trim();
        const sUser = String(req.data.sUser || "").trim();

        if (!correlationId) {
            return req.reject(400,
                "Informe o correlationId do caso para ler o detalhe no SAP Cloud ALM.");
        }

        // Sem reporter a ALM vazaria caso de outro usuario.
        if (!sUser) {
            return req.reject(400,
                "Informe o S-User do requisitante para ler o detalhe do caso no SAP Cloud ALM.");
        }

        let caso;
        try {
            caso = await lerCasoSapCru(await conectarCalmItsm(), correlationId, sUser);
        } catch (erro) {
            LOG.warn(`Falha ao ler o detalhe do caso ${correlationId} (S-User ${sUser}) no SAP `
                + `Cloud ALM: ${erro.message}`);
            return req.reject(502,
                `Nao foi possivel consultar o caso ${correlationId} no SAP Cloud ALM: ${erro.message}`);
        }

        // 404 em vez de detalhe em branco na tela, como no AnexoConteudo.
        if (!caso || typeof caso !== "object" || (!caso.id && !caso.caseNumber)) {
            LOG.warn(`SAP Cloud ALM nao devolveu detalhe do caso ${correlationId} `
                + `(S-User ${sUser}).`);
            return req.reject(404, `Caso ${correlationId} nao encontrado no SAP Cloud ALM.`);
        }

        return casoSapDetalhadoComoResposta(caso, correlationId);
    });

    // Unica escrita do app na SAP Cloud ALM: cria o caso de suporte de verdade e devolve o
    // correlationId, que e a unica chave para reabrir esse caso depois.
    this.on("AbrirCasoSap", async (req) => {
        const prioridade = String(req.data.prioridade || "").trim().toUpperCase();
        const componenteId = String(req.data.componenteId || "").trim();
        const customerNumber = String(req.data.customerNumber || "").trim();
        const installationNumber = String(req.data.installationNumber || "").trim();
        const systemNbr = String(req.data.systemNbr || "").trim();
        const titulo = String(req.data.titulo || "").trim();
        const descricao = String(req.data.descricao || "").trim();
        const sUserCliente = String(req.data.sUserCliente || "").trim();
        const sUserRequisitante = String(req.data.sUserRequisitante || "").trim();

        // send() cru nao passa pela validacao do CAP: sem isto a ALM devolve 400/428 generico.
        if (!PRIORIDADE_CASO_SAP[prioridade]) {
            return req.reject(400, `Prioridade invalida para o chamado SAP: ${prioridade}.`);
        }

        if (!componenteId) {
            return req.reject(400, "Informe o componente SAP para abrir o chamado.");
        }

        if (!customerNumber) {
            return req.reject(400, "Informe o numero do cliente para abrir o chamado SAP.");
        }

        if (!installationNumber) {
            return req.reject(400, "Informe o numero da instalacao para abrir o chamado SAP.");
        }

        if (!systemNbr) {
            return req.reject(400, "Informe o numero do sistema para abrir o chamado SAP.");
        }

        if (!titulo) {
            return req.reject(400, "Informe o titulo do chamado SAP.");
        }

        if (!descricao) {
            return req.reject(400, "Descreva o problema para abrir o chamado SAP.");
        }

        // sUserCliente (customer) e opcional no spec, entao nao bloqueia o envio.
        if (!sUserRequisitante) {
            return req.reject(400,
                "Informe o S-User do requisitante para abrir o chamado SAP.");
        }

        const corpo = {
            priority: PRIORIDADE_CASO_SAP[prioridade],
            component: componenteId,
            customerNumber,
            installationNumber,
            systemNbr,
            subject: titulo,
            description: descricao,
            reporter: sUserRequisitante
        };

        // customer e opcional: string vazia num campo opcional e um jeito conhecido de tomar 400.
        if (sUserCliente) {
            corpo.customer = sUserCliente;
        }

        // Trava de teste: com SAP_ABRIR_CASO_SIMULADO=1 o caminho inteiro da tela roda sem criar
        // registro real na SAP, que nao tem como ser desfeito depois.
        if (process.env.SAP_ABRIR_CASO_SIMULADO === "1") {
            LOG.warn(`Modo simulado de abertura de caso SAP: nenhuma chamada a ALM. `
                + `Corpo montado: ${JSON.stringify(corpo)}`);
            return { correlationId: `SIMULADO-${Date.now()}`, caseNumber: "", numeroPendente: true };
        }

        let calmItsmService;
        let resposta;
        try {
            calmItsmService = await conectarCalmItsm();
            // Corpo vai em data: no kind rest a chave "body" seria ignorada pelo send().
            resposta = await calmItsmService.send({
                method: "POST",
                path: "/supportcases/cases",
                data: corpo
            });
        } catch (erro) {
            // O cliente rest do CAP embrulha tudo em statusCode 502 e joga a resposta original em
            // reason: ler erro.status/erro.response aqui daria 502 em toda falha (client.js:200).
            const respostaErro = erro?.reason?.response;
            const mensagem = respostaErro?.body?.error?.message || erro.message;
            LOG.warn(`Falha ao abrir caso no SAP Cloud ALM (componente ${componenteId}, `
                + `cliente ${customerNumber}, reporter ${sUserRequisitante}): ${mensagem}`);

            const status = Number(respostaErro?.status ?? erro?.status ?? 0);

            // Nunca reenviar apos falha, nem em timeout: o CasePost nao tem chave de deduplicacao.
            if (status === 400 || status === 428) {
                return req.reject(400,
                    `SAP Cloud ALM recusou os dados do chamado: ${mensagem}`);
            }

            if (status === 429) {
                return req.reject(429,
                    "SAP Cloud ALM esta limitando as requisicoes. Aguarde e tente novamente.");
            }

            return req.reject(502,
                `Nao foi possivel abrir o chamado no SAP Cloud ALM: ${mensagem}`);
        }

        const correlationId = String(resposta?.id ?? "").trim();

        if (!correlationId) {
            LOG.warn(`SAP Cloud ALM aceitou o POST do caso (componente ${componenteId}, `
                + `cliente ${customerNumber}) mas nao devolveu o id.`);
            return req.reject(502, "SAP Cloud ALM nao devolveu o identificador do caso; o chamado "
                + "PODE ter sido criado. Confira em Acompanhar chamados SAP antes de tentar de novo.");
        }

        // O POST devolve so o correlationId; o caseNumber so existe no GET. O caso ja existe na
        // SAP neste ponto, entao rejeitar aqui faria a tela mentir dizendo que nao foi criado.
        let caseNumber = "";
        try {
            const caso = await lerCasoSapCru(calmItsmService, correlationId, sUserRequisitante);
            caseNumber = String(caso?.caseNumber ?? "").trim();
        } catch (erro) {
            LOG.warn(`Caso ${correlationId} criado, mas a leitura do numero falhou: ${erro.message}`);
        }

        LOG.info(`Caso SAP criado: correlationId ${correlationId}, `
            + `caseNumber ${caseNumber || "(pendente)"}, componente ${componenteId}`);

        return { correlationId, caseNumber, numeroPendente: !caseNumber };
    });

    // Conversa do chat SAP: um GET por clique na lista da esquerda. A chave e o correlationId (o
    // mesmo de /supportcases/cases): com o caseNumber a ALM devolve vazio.
    this.on("ComentariosCasoSap", async (req) => {
        const correlationId = String(req.data.correlationId || "").trim();
        const sUser = String(req.data.sUser || "").trim();
        const vazio = { total: 0, exibidos: 0, truncado: false, comentarios: [] };

        if (!correlationId) {
            return req.reject(400,
                "Informe o correlationId do caso para ler os comentarios.");
        }

        // Mesma regra dos casos: sem reporter a ALM escolhe o escopo sozinha e devolveria
        // comentario de caso de outro usuario; vazio e melhor que consulta aberta.
        if (!sUser) {
            LOG.warn(`Comentarios do caso ${correlationId} sem S-User: conversa volta vazia.`);
            return vazio;
        }

        const parametros = new URLSearchParams({
            id: correlationId,
            reporter: sUser,
            limit: String(LIMITE_COMENTARIOS_CASO_SAP)
        });

        let resposta;
        try {
            const calmItsmService = await conectarCalmItsm();
            resposta = await calmItsmService.send({
                method: "GET",
                path: `/supportcases/cases/comments?${parametros}`
            });
        } catch (erro) {
            LOG.warn(`Falha ao ler os comentarios do caso ${correlationId} `
                + `(S-User ${sUser}): ${erro.message}`);
            return req.reject(502,
                `Nao foi possivel consultar os comentarios do caso: ${erro.message}`);
        }

        const linhas = Array.isArray(resposta?.results) ? resposta.results : [];

        // O envelope traz um count que e o tamanho da propria pagina e nao diz nada a tela: quem
        // responde "faltou comentario?" e o totalCount contra o limit.
        const total = Number(resposta?.totalCount ?? linhas.length);

        const comentarios = linhas
            .map((linha) => ({
                // value vem em HTML ("<p>Hello!</p>"): a bolha do chat mostra texto, nao markup.
                texto: textoSimplesDoHtml(linha.value),
                // "2021-06-01 12:00:00" em UTC, repassado como veio: o servidor nao conhece o
                // fuso do usuario, e o parse mora no frontend (_paraIsoLocal).
                quando: String(linha.createdAt ?? ""),
                // A ALM so tem o S-User; nome de pessoa nao existe neste endpoint.
                autor: String(linha.createdBy ?? ""),
                // Unico discriminador de direcao da bolha: "Info for SAP" e o que o cliente
                // escreveu, "Info for Customer" e a resposta da SAP.
                tipo: String(linha.type ?? "")
            }))
            // Comentario sem texto viraria bolha em branco na conversa.
            .filter((comentario) => comentario.texto);

        return {
            total,
            // Compara com a PAGINA lida, nao com exibidos: comentario vazio filtrado encurta a
            // lista sem que a ALM tenha escondido nada.
            truncado: total > linhas.length,
            exibidos: comentarios.length,
            comentarios
        };
    });

    // Unica escrita do chat: 1 POST por mensagem. Mesma chave do GET (o correlationId, nunca o
    // caseNumber), mas aqui id e reporter sao required, entao nada de "devolve vazio" sem S-User.
    this.on("EnviarComentarioCasoSap", async (req) => {
        const correlationId = String(req.data.correlationId || "").trim();
        const sUser = String(req.data.sUser || "").trim();
        const texto = String(req.data.texto ?? "").trim();

        // send() cru nao passa pela validacao do CAP: sem isto a ALM devolve 400/428 generico.
        if (!correlationId) {
            return req.reject(400,
                "Informe o correlationId do caso para enviar o comentario.");
        }

        // Diferente do GET, reporter e required aqui: vazio postaria fora de escopo ou daria 428.
        if (!sUser) {
            return req.reject(400,
                "Informe o S-User do requisitante para enviar o comentario.");
        }

        if (!texto) {
            return req.reject(400, "Informe o texto do comentario.");
        }

        if (texto.length > TAMANHO_MAXIMO_COMENTARIO_CASO_SAP) {
            return req.reject(400, `O comentario passa de `
                + `${TAMANHO_MAXIMO_COMENTARIO_CASO_SAP} caracteres; encurte a mensagem.`);
        }

        // Texto puro: HTML so aparece na volta do GET (Comment.value), nunca no que se envia.
        const corpo = { text: texto };

        // O POST devolve so o id, entao o horario sai daqui - no formato do GET, que a tela le.
        const quando = new Date().toISOString().slice(0, 19).replace("T", " ");

        // Flag propria: quem testa envio de mensagem nao quer travar tambem a abertura de caso.
        if (process.env.SAP_COMENTAR_CASO_SIMULADO === "1") {
            LOG.warn(`Modo simulado de comentario no caso SAP ${correlationId}: nenhuma chamada a `
                + `ALM. Corpo montado: ${JSON.stringify(corpo)}`);
            return {
                correlationId,
                comentario: { texto, quando, autor: sUser, tipo: TIPO_COMENTARIO_CLIENTE_SAP }
            };
        }

        const parametros = new URLSearchParams({ id: correlationId, reporter: sUser });

        let resposta;
        try {
            const calmItsmService = await conectarCalmItsm();
            // Corpo vai em data: no kind rest a chave "body" seria ignorada pelo send().
            resposta = await calmItsmService.send({
                method: "POST",
                path: `/supportcases/cases/comments?${parametros}`,
                data: corpo
            });
        } catch (erro) {
            // O cliente rest do CAP embrulha tudo em statusCode 502 e joga a resposta original em
            // reason: ler erro.status/erro.response aqui daria 502 em toda falha (client.js:200).
            const respostaErro = erro?.reason?.response;
            const mensagem = respostaErro?.body?.error?.message || erro.message;
            LOG.warn(`Falha ao comentar no caso SAP ${correlationId} `
                + `(reporter ${sUser}): ${mensagem}`);

            const status = Number(respostaErro?.status ?? erro?.status ?? 0);

            // Nunca reenviar, nem em timeout: sem deduplicacao, a mensagem pode ja ter gravado.
            if (status === 400 || status === 428) {
                return req.reject(400,
                    `SAP Cloud ALM recusou o comentario: ${mensagem}`);
            }

            if (status === 429) {
                return req.reject(429,
                    "SAP Cloud ALM esta limitando as requisicoes. Aguarde e tente novamente.");
            }

            return req.reject(502,
                `Nao foi possivel enviar o comentario ao SAP Cloud ALM: ${mensagem}`);
        }

        // Id vazio nao desfaz a gravacao: ecoar a chave e melhor que a tela dizer que nao enviou.
        const idCaso = String(resposta?.id ?? "").trim() || correlationId;

        LOG.info(`Comentario enviado ao caso SAP ${idCaso} `
            + `(reporter ${sUser}, ${texto.length} caracteres).`);

        return {
            correlationId: idCaso,
            comentario: { texto, quando, autor: sUser, tipo: TIPO_COMENTARIO_CLIENTE_SAP }
        };
    });

    // Mesmo escopo da lista da tela, sem o teto de 100 dela: sem o contato a varredura viraria o
    // tenant inteiro (20 mil chamados MEDIDOS) para responder a mesma pergunta.
    this.on("ClientesDistintosChamados", async (req) => {
        const contatoId = String(req.data.contatoId || "").trim();

        if (!contatoId) {
            return req.reject(400,
                "Informe o contatoId do requisitante para levantar os clientes dos chamados.");
        }

        const campoEscopo = req.data.executor
            ? CAMPO_ESCOPO_EXECUTOR_C4C
            : CAMPO_ESCOPO_REQUISITANTE_C4C;

        for (const [chave, entrada] of cacheClientesDistintosChamados) {
            if (Date.now() - entrada.quando >= TTL_CACHE_CLIENTES_DISTINTOS_MS) {
                cacheClientesDistintosChamados.delete(chave);
            }
        }

        // Chave com escopo: uma global entregaria os clientes de um usuario ao proximo.
        const chaveCache = `${campoEscopo}:${contatoId}`;
        const emCache = cacheClientesDistintosChamados.get(chaveCache);

        if (!req.data.atualizar && emCache) {
            LOG.info(`Clientes distintos de ${chaveCache} servidos do cache `
                + `(${emCache.dados.distintos} clientes, ${Date.now() - emCache.quando} ms de idade).`);

            // Copia funda: o consumidor mexer no array ou nos itens corromperia o cache.
            return {
                ...emCache.dados,
                clientes: emCache.dados.clientes.map((cliente) => ({ ...cliente }))
            };
        }

        const inicioTudo = Date.now();
        const { ServiceRequestCollection } = ticketService.entities;

        // Guardar as linhas varridas seriam dezenas de MB: fica so ID -> BuyerPartyID.
        const parceiroPorChamado = new Map();
        let linhasLidas = 0;
        let paginas = 0;
        let concluido = false;
        let primeiroDaPaginaAnterior = "";

        try {
            while (paginas < MAXIMO_PAGINAS_CHAMADOS_C4C) {
                // Ordem default do C4C nao e contratual: sem orderBy o $skip perde e repete linha.
                const linhas = linhasDaResposta(await ticketService.run(
                    SELECT.from(ServiceRequestCollection)
                        .columns("ObjectID", "ID", "BuyerPartyID")
                        .where({ [campoEscopo]: contatoId })
                        .orderBy("ID desc")
                        .limit(LIMITE_CHAMADOS_C4C, linhasLidas)
                ));

                paginas += 1;
                linhasLidas += linhas.length;

                for (const linha of linhas) {
                    // Chave e o ObjectID, nao o ID (Nullable no edmx): dedupe overlap de pagina sem
                    // sumir com chamado sem ID, que nem em semCustomerNumber entrava.
                    const chave = String(linha?.ObjectID ?? "").trim()
                        || String(linha?.ID ?? "").trim();
                    if (!chave) continue;
                    parceiroPorChamado.set(chave, String(linha?.BuyerPartyID ?? "").trim());
                }

                const primeiro = String(linhas[0]?.ObjectID ?? linhas[0]?.ID ?? "");
                const paginaRepetida = Boolean(primeiro) && primeiro === primeiroDaPaginaAnterior;
                primeiroDaPaginaAnterior = primeiro;

                // Pagina vazia e o unico fim confiavel: pagina curta tambem pode ser teto do tenant.
                if (!linhas.length) {
                    concluido = true;
                    break;
                }

                // Pagina repetida e $skip ignorado: o resto do tenant ficou sem ler, logo truncado.
                if (paginaRepetida) {
                    LOG.warn("ServiceRequestCollection devolveu a mesma pagina duas vezes "
                        + `(offset ${linhasLidas - linhas.length}); varredura encerrada.`);
                    break;
                }

                if (linhasLidas >= MAXIMO_TOTAL_CHAMADOS_C4C) break;
            }
        } catch (erro) {
            LOG.warn(`Falha ao varrer a ServiceRequestCollection na pagina ${paginas + 1}: `
                + erro.message);

            // Parcial ainda responde algo util; sem chamado nenhum nao ha o que agregar.
            if (!parceiroPorChamado.size) {
                return req.reject(502,
                    `Nao foi possivel varrer os chamados do C4C: ${erro.message}`);
            }
        }

        const truncado = !concluido;
        const msChamados = Date.now() - inicioTudo;

        // Distintos antes dos lotes: cliente com 3 mil chamados custaria 3 mil ids no $filter.
        const parceiros = [...new Set([...parceiroPorChamado.values()].filter(Boolean))];

        const numeroPorParceiro = new Map();
        let falhaClientes = false;
        // Ecoado na resposta: so no log, "0 clientes" nao diz se foi lote, destination ou cadastro.
        let erroClientes = "";
        let sondagensFalhas = 0;
        let consultasClientes = 0;
        let abortado = false;

        // Com lote fixo de 50 TODO lote caiu no primeiro uso real e a lista saiu vazia; encolher
        // sozinho no erro deixa o C4C do tenant decidir o teto, em vez de um numero chutado aqui.
        let tamanhoLote = MAXIMO_PARCEIROS_POR_LOTE_SAP;

        const resolverLote = async (lote) => {
            if (abortado || !lote.length) return;

            consultasClientes += 1;

            try {
                for (const cliente of await consultarClientesSap(c4cService, lote)) {
                    if (!cliente.businessPartnerId || !cliente.customerNumber) continue;
                    numeroPorParceiro.set(cliente.businessPartnerId, cliente.customerNumber);
                }

                return;
            } catch (erro) {
                erroClientes ||= erro.message;

                if (Number(erro?.status ?? erro?.statusCode ?? 0) === 429) {
                    LOG.warn(`Rate limit do C4C atingido com ${LOTES_SIMULTANEOS_CLIENTES_C4C} `
                        + "lotes simultaneos; reduza SAP_LOTES_SIMULTANEOS_CLIENTES.");
                }

                // Um id sozinho falhando nao e tamanho de lote: e conexao, destination ou parceiro.
                // Insistir aqui seria uma requisicao morta por parceiro no tenant inteiro.
                if (lote.length === 1) {
                    falhaClientes = true;
                    sondagensFalhas += 1;
                    LOG.warn("Falha ao consultar BusinessPartnerCollection do parceiro "
                        + `${lote[0]}: ${erro.message}`);

                    if (sondagensFalhas >= MAXIMO_SONDAGENS_FALHAS_CLIENTES) {
                        abortado = true;
                        LOG.warn(`${sondagensFalhas} consultas de UM parceiro falharam; a fase de `
                            + "clientes foi abortada. Nao e o tamanho do lote: verifique o "
                            + `destination c4c (c4codataapi). Primeiro erro: ${erroClientes}`);
                    }

                    return;
                }

                const meio = Math.ceil(lote.length / 2);
                tamanhoLote = Math.min(tamanhoLote, meio);

                LOG.warn(`Lote de ${lote.length} parceiros recusado pelo C4C, dividindo em ${meio}: `
                    + erro.message);

                await resolverLote(lote.slice(0, meio));
                await resolverLote(lote.slice(meio));
            }
        };

        // Cursor e nao lotes pre-fatiados: o que ainda nao saiu nasce no tamanho ja aprendido.
        let proximoParceiro = 0;
        await emParalelo(LOTES_SIMULTANEOS_CLIENTES_C4C, parceiros.length, async () => {
            while (proximoParceiro < parceiros.length && !abortado) {
                const inicio = proximoParceiro;
                proximoParceiro = Math.min(parceiros.length, inicio + tamanhoLote);

                await resolverLote(parceiros.slice(inicio, proximoParceiro));
            }
        });

        const contagemPorNumero = new Map();
        let semCustomerNumber = 0;

        for (const parceiro of parceiroPorChamado.values()) {
            const numero = parceiro ? numeroPorParceiro.get(parceiro) : "";

            // Sem BuyerPartyID, sem cadastro e sem o campo z dao o mesmo vazio; so falhaClientes
            // separa isso de uma queda do C4C.
            if (!numero) {
                semCustomerNumber += 1;
                continue;
            }

            contagemPorNumero.set(numero, (contagemPorNumero.get(numero) ?? 0) + 1);
        }

        const clientes = [...contagemPorNumero]
            .map(([customerNumber, chamados]) => ({ customerNumber, chamados }))
            .sort((a, b) => a.customerNumber.localeCompare(b.customerNumber));

        const dados = {
            chamadosLidos: parceiroPorChamado.size,
            // O C4C recusa $count/$inlinecount na ServiceRequestCollection: total = o que foi lido.
            chamadosTotal: parceiroPorChamado.size,
            semCustomerNumber,
            distintos: clientes.length,
            clientes,
            truncado,
            falhaClientes,
            erroClientes
        };

        cacheClientesDistintosChamados.set(chaveCache, { quando: Date.now(), dados });

        if (truncado) {
            LOG.warn(`Varredura de chamados do C4C truncada em ${linhasLidas} linhas / ${paginas} `
                + "paginas; a lista de clientes nao cobre o tenant inteiro.");
        }

        // Diagnostico de lentidao: e a latencia por pagina do C4C que manda no tempo total.
        LOG.info(`Clientes distintos de ${chaveCache}: ${dados.chamadosLidos} chamados em ${paginas} `
            + `paginas em ${msChamados} ms, ${parceiros.length} parceiros distintos em `
            + `${consultasClientes} consultas (lote final ${tamanhoLote}, `
            + `${LOTES_SIMULTANEOS_CLIENTES_C4C} simultaneos) em `
            + `${Date.now() - inicioTudo - msChamados} ms, ${clientes.length} clientes, `
            + `${semCustomerNumber} sem numero, falhaClientes ${falhaClientes}, `
            + `truncado ${truncado}. Total ${Date.now() - inicioTudo} ms.`);

        return { ...dados, clientes: clientes.map((cliente) => ({ ...cliente })) };
    });
});