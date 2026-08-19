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

// Identidade de quem le a conversa do caso pelo CHAMADO. Nao usa resolverEmailDoRequisitante
// direto: la o e-mail informado pelo frontend VENCE o JWT ate em producao (toggle PROVISORIO de
// homologacao), e la o preco disso e a UI - flags de perfil. Aqui o preco seria o DADO: e o e-mail
// que escolhe de quem sao os chamados relidos no C4C e, por eles, os comentarios lidos na ALM SEM
// 'reporter'. Com o e-mail do navegador vencendo, qualquer usuario autenticado passaria o e-mail de
// um contato de outro cliente e leria a conversa dele - o mesmo vazamento que a decisao de nao
// aceitar correlationId da tela existe para evitar, so trocando a chave. Entao em producao manda o
// JWT (precedencia de resolverEmailDoChat) e o e-mail informado so entra quando o JWT nao traz
// nada; fora de producao o toggle continua valendo, que e onde ele se homologa. CRU, sem
// toLowerCase, pelo mesmo motivo de resolverEmailDoRequisitante: vai para EMailURI/Email do C4C,
// comparacoes exatas.
function resolverEmailDoEscopoCasoSap(req) {
    const emailInformado = String((req.data && req.data.email) || "").trim();
    const emailLogado = String((req.user && req.user.attr && req.user.attr.email) || "").trim();

    if (!ehProducao()) {
        return emailInformado || emailLogado || EMAIL_CONTATO_DEV;
    }

    if (emailLogado) {
        return emailLogado;
    }

    if (emailInformado) {
        LOG.warn(`JWT sem attr.email em producao: escopo da conversa do caso resolvido pelo e-mail `
            + `informado (${emailInformado}). Conferir o atributo email do xsuaa.`);
    }

    return emailInformado;
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

// O enum CaseStatusCode (CALM_ITSM.json) traz "Confirmed", mas a descricao do mesmo campo escreve
// 'CONFIRMED': vale o enum, porque e ele que o servidor valida.
const STATUS_CASO_SAP_ENCERRADO = "Confirmed";

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

// O POST de /supportcases/cases devolve so o id: o caseNumber aparece num GET de detalhe que, logo
// depois do create, ainda pode responder sem numero. Sem os campos Z preenchidos aos DOIS o chamado
// nunca entra no "Chat com SAP" (a leitura exige numero E id), entao vale insistir aqui - e barato
// perto de deixar o vinculo capenga. 3 tentativas porque o dialogo do usuario espera esta resposta:
// mais que isso prenderia a tela por um campo que o backfill das leituras tambem sabe completar.
const TENTATIVAS_NUMERO_CASO_SAP = 3;

// Espera entre as tentativas do numero. Somada, segura o dialogo por no maximo ~3 s no pior caso.
const ESPERA_NUMERO_CASO_SAP_MS = 1500;

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

// Teto por chamada, MEDIDO e nao chutado: 30 casos = 60 GETs = ~21 s a 6 em paralelo neste
// tenant (2,5-2,9 req/s estaveis). 60 casos passariam de 40 s para um enriquecimento que roda em
// TODA recarga de /Tickets; acima disso a tela fica com o fallback do chamado e truncado avisa.
const MAXIMO_CONVERSAS_ENRIQUECIDAS_SAP = 30;

// So o comentario mais recente interessa aqui: a lista mostra UMA data. A ordem DESC da ALM foi
// observada, nao documentada (o endpoint nao tem sort), entao o limit e barato e a defesa e o
// maximo sobre o que voltou - ver ultimaDataDeComentarios.
const LIMITE_ULTIMO_COMENTARIO_CASO_SAP = 1;

// O POST nao aceita type: sem este valor a tela releria a conversa so para saber o lado da bolha.
const TIPO_COMENTARIO_CLIENTE_SAP = "Info for SAP";

// Teto nosso, nao da API: a SAP corta texto longo em silencio, e um 400 explicito avisa.
const TAMANHO_MAXIMO_COMENTARIO_CASO_SAP = 5000;

// Teto do GET de listagem de anexos: fecha a lista numa chamada so, e truncado avisa o resto.
const LIMITE_ANEXOS_CASO_SAP = 100;

// Mesmo teto do FileUploader do front (MAX_BYTES_ANEXO): o base64 de 10 MB da 13.981.016 bytes
// contra os 15.728.640 do @cds.server.body_parser.limit, sobrando ~11%. A SAP aceita 30 MB, mas
// dois arquivos nesse tamanho nem chegariam ao handler.
const TAMANHO_MAXIMO_ANEXO_CASO_SAP_BYTES = 10 * 1024 * 1024;

// Lista INTEIRA do BinaryAttachment (CALM_ITSM.json), espelhada em EXTENSOES_ANEXO_SAP do
// controller: fora dela a ALM devolve 200 com url e descarta o arquivo em silencio, entao recusar
// aqui e a unica defesa. Nao encurtar por gosto - sar, car, dmp, har, eml, evtx e trace sao
// justamente o que o suporte da SAP pede, e o 7z e o unico ausente da lista da SAP.
const EXTENSOES_ANEXO_CASO_SAP = ["016", "abp", "addons", "aml", "asc", "atl", "avi", "biar", "bmp",
    "bpmn", "bz2", "cab", "callstack", "car", "cif", "csv", "dkp", "dmp", "doc", "docm", "docx",
    "dwi", "elg", "eml", "err", "error", "errorinfo", "evtx", "gif", "glf", "gz", "gzip", "har",
    "htm", "html", "hwl", "inf", "ini", "iqmsq", "jar", "jpeg", "jpg", "json", "lcmbiar", "log",
    "mdb", "mdl", "mmap", "monitor", "mov", "mp4", "msg", "odp", "ods", "odt", "out", "par",
    "pcapng", "pcx", "pdf", "pl", "pml", "png", "pps", "ppsx", "ppt", "pptx", "properties", "prt",
    "rar", "rep", "rh", "rpm", "rpt", "rtf", "sar", "sav", "saz", "sca", "sck", "scm", "sgx", "sh",
    "sim", "snp", "sqf", "sqlite", "tar", "tgz", "tif", "trace", "trc", "tsk", "txt", "tz", "udc",
    "udt", "unv", "url", "vds", "ver", "war", "wav", "wid", "wmv", "wri", "xlb", "xlc", "xlf",
    "xls", "xlsm", "xlsx", "xlt", "xml", "xsl", "z", "z01", "z02", "z03", "z04", "z05", "zip"];

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

// 2 min e nao 5: e a data que aparece na LISTA, e o clique le a conversa ao vivo - servi-la mais
// vencida que isso mostraria na linha uma data mais velha que a ultima bolha do chat aberto.
const TTL_CACHE_CONVERSA_CASO_SAP_MS = 2 * 60 * 1000;

// Processo vive semanas no CF: Map por correlationId sem teto vira leak (mesmo motivo do cache
// de ultima mensagem).
const MAXIMO_ENTRADAS_CACHE_CONVERSA_CASO_SAP = 500;

// Chave = correlationId, NUNCA o usuario: numero, assunto e data sao do CASO. O escopo (quem
// pode ver esse caso) e refeito no C4C a cada chamada, antes de qualquer leitura do cache.
const cacheConversaCasoSapPorCorrelacao = new Map();

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

// Mesmo desenho do cache de ultima mensagem: expira por TTL e, se ainda passar do teto, descarta
// as mais antigas (o Map guarda a ordem de insercao, entao a primeira chave e a mais velha).
function limparCacheConversaCasoSap() {
    const iAgora = Date.now();

    for (const [sChave, oEntrada] of cacheConversaCasoSapPorCorrelacao) {
        if (iAgora - oEntrada.quando >= TTL_CACHE_CONVERSA_CASO_SAP_MS) {
            cacheConversaCasoSapPorCorrelacao.delete(sChave);
        }
    }

    while (cacheConversaCasoSapPorCorrelacao.size > MAXIMO_ENTRADAS_CACHE_CONVERSA_CASO_SAP) {
        cacheConversaCasoSapPorCorrelacao.delete(
            cacheConversaCasoSapPorCorrelacao.keys().next().value);
    }
}

// Toda escrita poda: os 6 trabalhadores gravam concorrentemente e uma limpeza avulsa por chamada
// deixaria o Map passar do teto entre uma poda e outra.
function gravarCacheConversaCasoSap(correlationId, dados) {
    cacheConversaCasoSapPorCorrelacao.set(correlationId, { quando: Date.now(), dados });
    limparCacheConversaCasoSap();
}

// Confere o TTL na leitura tambem: a varredura de 30 casos pode durar mais que a janela, o que
// serviria data vencida no fim do lote.
function lerCacheConversaCasoSap(correlationId) {
    const oEntrada = cacheConversaCasoSapPorCorrelacao.get(correlationId);
    if (!oEntrada) return null;

    if (Date.now() - oEntrada.quando >= TTL_CACHE_CONVERSA_CASO_SAP_MS) {
        cacheConversaCasoSapPorCorrelacao.delete(correlationId);
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

// GET unico de /supportcases/cases: os filtros chegam prontos porque ha dois escopos - o caminho
// do S-User consulta por id+reporter, e o caminho do chamado (sem S-User) consulta por caseNumber e
// cai para id. Um send so evita as duas versoes divergirem se o path mudar. Nao trata erro.
async function lerCasosSapCru(calmItsmService, filtros) {
    const parametros = new URLSearchParams(filtros);

    return calmItsmService.send({
        method: "GET",
        path: `/supportcases/cases?${parametros}`
    });
}

// GET unico da lista e do detalhe: evita as duas divergirem se path/reporter mudarem. Nao trata erro.
// Assinatura preservada de proposito: lista, detalhe e o GET do numero do AbrirCasoSap continuam
// pedindo id+reporter na MESMA ordem de query de antes.
async function lerCasoSapCru(calmItsmService, correlationId, sUser) {
    return lerCasosSapCru(calmItsmService, { id: correlationId, reporter: sUser });
}

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Numero do caso RECEM-CRIADO, com insistencia: o POST devolve so o id e o GET logo em seguida
// pode responder o caso ainda sem caseNumber. Nunca lanca - o caso ja existe na ALM neste ponto,
// entao falha aqui e numero pendente (que o backfill das leituras resolve depois), nunca erro do
// fluxo. Devolve "" quando as tentativas se esgotam.
async function lerNumeroDoCasoSap(calmItsmService, correlationId, sUser) {
    for (let tentativa = 1; tentativa <= TENTATIVAS_NUMERO_CASO_SAP; tentativa += 1) {
        // Espera ANTES da 2a em diante e nunca antes da 1a: o caminho feliz nao paga latencia.
        if (tentativa > 1) await esperar(ESPERA_NUMERO_CASO_SAP_MS);

        try {
            const caso = await lerCasoSapCru(calmItsmService, correlationId, sUser);
            const caseNumber = String(caso?.caseNumber ?? "").trim();

            if (caseNumber) return caseNumber;

            LOG.warn(`Caso ${correlationId} respondeu sem caseNumber na tentativa `
                + `${tentativa}/${TENTATIVAS_NUMERO_CASO_SAP}.`);
        } catch (erro) {
            LOG.warn(`Falha ao ler o numero do caso ${correlationId} na tentativa `
                + `${tentativa}/${TENTATIVAS_NUMERO_CASO_SAP}: ${erro.message}`);
        }
    }

    return "";
}

// Grava os campos Z do caso SAP no header do chamado no C4C. E este par que amarra chamado e caso:
// sem ele o caso existe na ALM e nenhuma tela do requisitante sabe disso (as leituras partem do
// z_id_sfm_KUT do chamado, nunca de um id vindo do navegador). Escrita ACESSORIA, no mesmo desenho
// de AtualizarComponenteChamado: nunca lanca, porque o caso ja existe na SAP e derrubar o fluxo
// aqui faria a tela dizer que o chamado nao foi aberto. Devolve true so quando o UPDATE passou.
// caseNumber vazio NAO cancela a escrita: gravar so o id preserva o vinculo, e o numero e
// completado depois pelo backfill das leituras.
async function gravarCasoSapNoChamado(ticketService, objectID, correlationId, caseNumber, contexto) {
    const chamado = String(objectID ?? "").trim();
    const id = String(correlationId ?? "").trim();
    const numero = String(caseNumber ?? "").trim();

    if (!chamado || !id) {
        LOG.warn(`Vinculo do caso SAP nao gravado (${contexto}): ObjectID "${chamado}" ou `
            + `correlationId "${id}" ausente.`);
        return false;
    }

    // Campo por campo e nao objeto fixo: mandar z_case_number_KUT: "" no backfill APAGARIA o
    // numero que outra sessao ja tivesse gravado.
    const campos = { z_id_sfm_KUT: id };
    if (numero) campos.z_case_number_KUT = numero;

    const { ServiceRequestCollection } = ticketService.entities;

    try {
        // Mesmo caminho do PATCH do componente: UPDATE ... where(ObjectID) mantem a whitelist de
        // status do handler UPDATE de ServiceRequests intacta, e o CQN resolve key e CSRF.
        await ticketService.run(
            UPDATE(ServiceRequestCollection)
                .where({ ObjectID: chamado })
                .with(campos)
        );
    } catch (erro) {
        LOG.warn(`Falha ao gravar o caso ${numero || "(sem numero)"}/${id} no chamado ${chamado} `
            + `(${contexto}): ${erro.message}`);
        return false;
    }

    LOG.info(`Caso SAP ${numero || "(numero pendente)"}/${id} vinculado ao chamado ${chamado} `
        + `(${contexto}).`);
    return true;
}

// Um GET, dois escopos: com reporter (S-User) e sem (escopo ja garantido pelo chamado no C4C).
// limit sempre, e nao do chamador: sem ele vale o default nao documentado do servidor.
// filtros primeiro, limit depois: mantem a query id/reporter/limit do caminho que ja existia.
// limite opcional: o enriquecimento da lista quer so o comentario mais recente (limit=1) e a
// conversa quer a pagina inteira. Default preservado para nao mexer em quem ja chama.
async function lerComentariosCasoSapCru(calmItsmService, filtros, limite) {
    const parametros = new URLSearchParams({
        ...filtros,
        limit: String(limite || LIMITE_COMENTARIOS_CASO_SAP)
    });

    return calmItsmService.send({
        method: "GET",
        path: `/supportcases/cases/comments?${parametros}`
    });
}

// Aspas duplas e CRLF no nome quebrariam o Content-Disposition e injetariam partes falsas.
const textoSeguroMultipart = (valor) => String(valor ?? "").replace(/[\r\n"]/g, " ").trim();

// Multipart a mao: form-data existe so como dependencia transitiva do axios, e o send() do CAP
// entrega Buffer cru sem serializar (query.js: Buffer nunca vira JSON e o content-length sai certo).
function montarMultipartAnexoSap({ installation, nome, tipo, descricao, base64 }) {
    // '-' nunca aparece no alfabeto base64, entao este boundary nao colide com o conteudo.
    const limite = `----mwAnexoSap${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    const campo = (chave, valor) =>
        `--${limite}\r\nContent-Disposition: form-data; name="${chave}"\r\n\r\n${valor}\r\n`;
    const nomeSeguro = textoSeguroMultipart(nome);

    let corpo = campo("installation", textoSeguroMultipart(installation));

    if (nomeSeguro) corpo += campo("name", nomeSeguro);
    if (tipo) corpo += campo("type", textoSeguroMultipart(tipo));
    if (descricao) corpo += campo("description", textoSeguroMultipart(descricao));

    corpo += `--${limite}\r\nContent-Disposition: form-data; name="attachment"; `
        + `filename="${nomeSeguro || "anexo"}"\r\n`
        + `Content-Type: application/octet-stream\r\n\r\n${base64}\r\n`
        + `--${limite}--\r\n`;

    return { limite, corpo: Buffer.from(corpo, "utf8") };
}

// Extensao em minusculas, sem o ponto: e o campo "type" do POST e a chave da lista permitida.
const extensaoDoNomeAnexo = (nome) => {
    const texto = String(nome ?? "");
    const iPonto = texto.lastIndexOf(".");

    return iPonto >= 0 ? texto.slice(iPonto + 1).toLowerCase() : "";
};

// Formato do GET de listagem ("2021-06-01 12:00:00"): o POST nao devolve data e a tela le uma so.
const agoraNoFormatoDaAlm = () => new Date().toISOString().slice(0, 19).replace("T", " ");

// Mensagem de erro da ALM legivel tambem no GET binario: com _binary o axios usa arraybuffer para
// 4xx/5xx tambem, entao o corpo chega como Buffer e o body.error.message ficaria undefined - a
// falha viraria o inutil "Request failed with status code 400" e o motivo real se perderia.
const mensagemDeErroDaAlm = (respostaErro, erro) => {
    const corpo = respostaErro?.body;

    if (Buffer.isBuffer(corpo)) {
        try {
            return JSON.parse(corpo.toString("utf8"))?.error?.message || erro.message;
        } catch {
            // Corpo nao-JSON (pagina de login do gateway, por exemplo): o texto cru nao ajuda.
            return erro.message;
        }
    }

    return corpo?.error?.message || erro.message;
};

// contentType da ALM pode vir como EXTENSAO ("pdf") e nao como MIME: o schema Attachment documenta
// os dois. Sem normalizar, o Blob do download nasce com type "pdf" e o SO nao reconhece o arquivo.
const MIME_POR_EXTENSAO_ANEXO = {
    bmp: "image/bmp", csv: "text/csv", doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    eml: "message/rfc822", gif: "image/gif", gz: "application/gzip", gzip: "application/gzip",
    htm: "text/html", html: "text/html", jpeg: "image/jpeg", jpg: "image/jpeg",
    json: "application/json", mov: "video/quicktime", mp4: "video/mp4",
    msg: "application/vnd.ms-outlook", odp: "application/vnd.oasis.opendocument.presentation",
    ods: "application/vnd.oasis.opendocument.spreadsheet",
    odt: "application/vnd.oasis.opendocument.text", pdf: "application/pdf", png: "image/png",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    rar: "application/vnd.rar", rtf: "application/rtf", tar: "application/x-tar",
    tif: "image/tiff", xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xml: "application/xml", zip: "application/zip"
};

// Vazio de proposito no que nao reconhece: a tela usa o MIME_TYPE_PADRAO_ANEXO dela e nao um tipo
// inventado, que abriria o arquivo no aplicativo errado.
const mimeTypeDoAnexoDaAlm = (valor, nome) => {
    const texto = String(valor ?? "").trim().toLowerCase();

    if (texto.includes("/")) {
        return texto;
    }

    // Log/trc/txt e afins nao entram no mapa: a extensao do NOME e a mesma informacao, e text/plain
    // errado num binario e pior que tipo nenhum.
    return MIME_POR_EXTENSAO_ANEXO[texto] || MIME_POR_EXTENSAO_ANEXO[extensaoDoNomeAnexo(nome)] || "";
};

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

// Resposta de /supportcases/cases/comments -> envelope da conversa da tela. Compartilhada pelas
// DUAS functions da conversa (ComentariosCasoSap, por S-User, e ConversaCasoSapDoChamado, pelo
// chamado): o payload da ALM e um so, e duas copias divergiriam na primeira mudanca dele.
function comentariosCasoSapComoResposta(resposta) {
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
}

// Com o limit=1 de hoje a unica garantia e a ordem DESC OBSERVADA neste tenant (o endpoint ignora
// orderby); o maximo lexicografico ("YYYY-MM-DD HH:MM:SS") so defende se o limite subir.
// Nao passa por comentariosCasoSapComoResposta de proposito: ela descarta comentario sem texto, e
// comentario vazio ainda e uma mensagem para efeito de DATA.
function ultimaDataDeComentarios(resposta) {
    const linhas = Array.isArray(resposta?.results) ? resposta.results : [];

    return linhas.reduce((maior, linha) => {
        const quando = String(linha?.createdAt ?? "").trim();
        return quando > maior ? quando : maior;
    }, "");
}

// Um caso = 2 GETs (header + ultimo comentario), em SERIE: os trabalhadores ja deixam 6
// requisicoes em voo, que e a concorrencia MEDIDA sem 429, e dispara-los juntos dobraria isso.
// Nunca lanca: caso ilegivel volta com falha e a tela fica com o fallback do chamado.
async function enriquecerConversaCasoSap(calmItsmService, correlationId, contexto) {
    const emCache = lerCacheConversaCasoSap(correlationId);
    // Copia: o consumidor mexer no objeto corromperia o cache para as proximas chamadas.
    if (emCache) return { ...emCache.dados };

    let caso = null;
    try {
        const resposta = await lerCasosSapCru(calmItsmService, { id: correlationId });

        // Por id o Case vem SEM envelope (ver DetalheCasoSap); array e {results} ficam como
        // defesa caso o formato mude.
        const achado = (Array.isArray(resposta) ? resposta[0]
            : Array.isArray(resposta?.results) ? resposta.results[0]
                : resposta) || null;

        // Conferir a chave e a UNICA barreira deste GET: ele sai SEM 'reporter' (o escopo foi
        // feito no C4C). Sem isso, campo Z apontando para outro caso poria o numero e o assunto
        // de outro cliente na lista.
        if (achado && typeof achado === "object"
            && String(achado.id ?? "").trim() === correlationId) {
            caso = achado;
        } else if (achado) {
            LOG.warn(`ALM devolveu o caso ${achado.id || "<sem id>"} para o id ${correlationId} `
                + `(${contexto}): header descartado.`);
        }
    } catch (erro) {
        LOG.warn(`Falha ao ler o header do caso ${correlationId} (${contexto}): ${erro.message}`);
    }

    let ultimaMensagemEm = "";
    let comentariosFalharam = false;
    try {
        ultimaMensagemEm = ultimaDataDeComentarios(await lerComentariosCasoSapCru(
            calmItsmService, { id: correlationId }, LIMITE_ULTIMO_COMENTARIO_CASO_SAP));
    } catch (erro) {
        comentariosFalharam = true;

        // MEDIDO: o updatedAt do header e sempre >= a data do ultimo comentario (no caso de
        // teste, +1h34), entao so erra para mais - e vale bem mais que o outro fallback, que e a
        // data de ABERTURA do chamado.
        ultimaMensagemEm = String(caso?.updatedAt ?? "").trim();
        LOG.warn(`Falha ao ler o ultimo comentario do caso ${correlationId} (${contexto}): `
            + `${erro.message}; data cai para o updatedAt do header.`);
    }

    const dados = {
        caseNumber: String(caso?.caseNumber ?? "").trim(),
        subject: String(caso?.subject ?? "").trim(),
        ultimaMensagemEm,
        falha: !caso || comentariosFalharam
    };

    // Falha NAO entra no cache: erro transitorio da ALM ficaria grudado 2 min numa linha que a
    // proxima recarga resolveria.
    if (!dados.falha) gravarCacheConversaCasoSap(correlationId, dados);

    return dados;
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
                    subject: String(caso?.subject ?? ""),
                    // updatedAt vem NESTE payload e era descartado: nenhum GET novo, so paramos de
                    // jogar fora a unica data que o caso tem na lista (a linha do chat do BASIS
                    // aparecia sem data). Ultima ALTERACAO do caso, nao do ultimo comentario -
                    // MEDIDO que fica >= a data dele.
                    updatedAt: String(caso?.updatedAt ?? "")
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
        // ObjectID do chamado no C4C: e a chave do UPDATE que grava os campos Z no fim.
        const objectID = String(req.data.objectID || "").trim();

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

        // Barra ANTES do POST, e nao depois: sem ObjectID o caso nasceria na ALM sem como ser
        // gravado no chamado, e o POST nao tem chave de deduplicacao para o vinculo ser refeito
        // numa segunda tentativa - sobraria um caso orfao, invisivel para o requisitante.
        if (!objectID) {
            return req.reject(400,
                "Informe o ObjectID do chamado para vincular o caso aberto no SAP.");
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
            return {
                correlationId: `SIMULADO-${Date.now()}`, caseNumber: "",
                numeroPendente: true, vinculado: false
            };
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

        // O POST devolve so o correlationId; o caseNumber so existe no GET, que logo apos o create
        // ainda pode responder sem numero - dai as tentativas. O caso ja existe na SAP neste ponto,
        // entao rejeitar aqui faria a tela mentir dizendo que nao foi criado.
        const caseNumber = await lerNumeroDoCasoSap(calmItsmService, correlationId,
            sUserRequisitante);

        // Fecha o vinculo no C4C: e daqui que TODA tela do requisitante descobre que o chamado tem
        // caso na ALM. Feito no servidor, logo apos o create, e nao numa segunda chamada da tela:
        // browser fechado no meio deixaria o caso orfao, sem como ser reencontrado.
        const vinculado = await gravarCasoSapNoChamado(ticketService, objectID, correlationId,
            caseNumber, `abertura do caso pelo chamado ${objectID}`);

        LOG.info(`Caso SAP criado: correlationId ${correlationId}, `
            + `caseNumber ${caseNumber || "(pendente)"}, componente ${componenteId}, `
            + `chamado ${objectID} ${vinculado ? "vinculado" : "NAO vinculado"}`);

        return { correlationId, caseNumber, numeroPendente: !caseNumber, vinculado };
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

        let resposta;
        try {
            const calmItsmService = await conectarCalmItsm();
            resposta = await lerComentariosCasoSapCru(calmItsmService,
                { id: correlationId, reporter: sUser });
        } catch (erro) {
            LOG.warn(`Falha ao ler os comentarios do caso ${correlationId} `
                + `(S-User ${sUser}): ${erro.message}`);
            return req.reject(502,
                `Nao foi possivel consultar os comentarios do caso: ${erro.message}`);
        }

        return comentariosCasoSapComoResposta(resposta);
    });

    // Conversa do caso para quem nao tem S-User (funcional e requisitante): 1 chamada por clique.
    // A tela manda o ID DO CHAMADO; o correlationId sai daqui, do proprio chamado no C4C, porque
    // sem 'reporter' na ALM o escopo passa a ser o filtro do perfil no C4C. Aceitar o correlationId
    // do navegador abriria a conversa de caso de OUTRO cliente do tenant.
    this.on("ConversaCasoSapDoChamado", async (req) => {
        const chamadoId = String(req.data.chamadoId || "").trim();
        const vazio = {
            correlationId: "", caseNumber: "", subject: "", status: "", priority: "",
            customerNumber: "", createdAt: "", updatedAt: "", headerFalha: false,
            total: 0, exibidos: 0, truncado: false, comentarios: []
        };

        if (!chamadoId) {
            return req.reject(400, "Informe o ID do chamado para ler a conversa do caso.");
        }

        const inicio = Date.now();

        // Identidade e perfil pela propria function Requisitante, nao por um SELECT novo: e ela que
        // sabe resolver contato (ContactQueryByElements) x funcionario (EmployeeCollection) e
        // devolver o contatoId que escopa o chamado. O e-mail NAO e o req.data.email cru: quem
        // decide a identidade aqui e resolverEmailDoEscopoCasoSap (JWT na frente em producao),
        // senao o proprio parametro do navegador escolheria de quem e a conversa lida. Vai CRU (sem
        // toLowerCase): la dentro ele entra no EMailURI/Email do C4C, comparacoes exatas.
        let requisitante;
        try {
            requisitante = await this.send("Requisitante", {
                email: resolverEmailDoEscopoCasoSap(req)
            });
        } catch (erro) {
            LOG.warn(`Falha ao identificar o requisitante da conversa do chamado ${chamadoId}: `
                + `${erro.message}`);
            return req.reject(502,
                `Nao foi possivel identificar o requisitante: ${erro.message}`);
        }

        const contatoId = String(requisitante?.contatoId || "").trim();
        // "funcionario" e o literal que o handler Requisitante devolve (ver o retorno do fallback
        // pela EmployeeCollection); "contato" e o outro, e "" significa que ninguem achou o e-mail.
        const ehFuncionario = String(requisitante?.origem || "").trim() === "funcionario";

        // Falha fechada sem identidade: com contatoId vazio o SELECT sairia sem filtro de escopo e
        // devolveria chamado de qualquer cliente do tenant. Vazio, nunca reject - mesmo desenho de
        // ChamadosComMensagemNova.
        if (!contatoId) {
            LOG.warn(`Conversa do chamado ${chamadoId} sem requisitante identificado (JWT sem `
                + `attr.email e sem e-mail no request, ou e-mail sem contato/funcionario): `
                + `resposta vazia.`);
            return vazio;
        }

        // Mesmo par do frontend: funcionario interno entra como executor, contato como
        // requisitante.
        const campoEscopo = ehFuncionario
            ? CAMPO_ESCOPO_EXECUTOR_C4C
            : CAMPO_ESCOPO_REQUISITANTE_C4C;

        // O teste de dono e o PROPRIO where: ler por ID e conferir o dono depois deixaria a janela
        // de trazer o chamado de outro cliente para a memoria do servidor. where e nao
        // SELECT.one.from(E, {chave}): a key e o ObjectID, e o ID e Nullable no edmx.
        const { ServiceRequestCollection } = ticketService.entities;
        let linha;
        try {
            linha = linhasDaResposta(await ticketService.run(
                SELECT.one.from(ServiceRequestCollection)
                    .columns("ID", "ObjectID", "z_case_number_KUT", "z_id_sfm_KUT")
                    .where({ ID: chamadoId, [campoEscopo]: contatoId })
            ))[0];
        } catch (erro) {
            LOG.warn(`Falha ao reler o chamado ${chamadoId} (${campoEscopo}=${contatoId}): `
                + `${erro.message}`);
            return req.reject(erro.statusCode || 502,
                `Nao foi possivel ler o chamado ${chamadoId}: ${erro.message}`);
        }

        // Nao e dono (ou o chamado nao existe): vazio SEM tocar na ALM. 404 nao muda nada para a
        // tela e diria a quem sondar que o chamado existe.
        if (!linha) {
            LOG.warn(`Chamado ${chamadoId} fora do escopo de ${campoEscopo}=${contatoId}: `
                + `conversa volta vazia sem consultar a ALM.`);
            return vazio;
        }

        const caseNumber = String(linha.z_case_number_KUT ?? "").trim();
        const correlationId = String(linha.z_id_sfm_KUT ?? "").trim();

        // Sem o z_id_sfm_KUT nao ha caso na ALM para ler - ausencia de campo custom e dado valido
        // (o chamado nao foi encaminhado a SAP), nao erro. So o ID e exigido: ele e a chave do GET
        // de header E a dos comentarios, e o numero pode estar pendente num caso recem-aberto -
        // barrar por ele deixaria a conversa inacessivel justamente ate alguem completar o campo.
        if (!correlationId) {
            LOG.warn(`Chamado ${chamadoId} sem z_id_sfm_KUT ("${caseNumber}"/"${correlationId}"): `
                + `nao ha caso na ALM para ler.`);
            return vazio;
        }

        let calmItsmService;
        try {
            calmItsmService = await conectarCalmItsm();
        } catch (erro) {
            LOG.warn(`Falha ao conectar no SAP Cloud ALM para a conversa do chamado ${chamadoId}: `
                + `${erro.message}`);
            return req.reject(502, `Nao foi possivel conectar no SAP Cloud ALM: ${erro.message}`);
        }

        // Header SEM 'reporter': estes perfis nao tem S-User confiavel e o escopo ja foi feito no
        // C4C (o chamado voltou no filtro do proprio usuario) - MEDIDO: sem reporter a ALM responde
        // o caso normalmente.
        // Ordem id -> caseNumber e nao o contrario: MEDIDO neste tenant que
        // /supportcases/cases?caseNumber=<n> responde 428 PRECONDITION_REQUIRED ("Required request
        // parameter 'id' ... is not present"), igual ao que o CALM_ITSM.json documenta (id e o unico
        // filtro do endpoint). Tentar caseNumber primeiro custaria um round-trip perdido em TODO
        // clique; ele fica como segunda tentativa para o dia em que a ALM aceitar o parametro.
        // Header NAO derruba a conversa, e o log diz qual dos dois serviu.
        let caso = null;
        let headerPorOnde = "";
        // Segunda tentativa so quando ha numero: { caseNumber: "" } consultaria a ALM sem chave.
        const filtrosDoHeader = caseNumber
            ? [{ id: correlationId }, { caseNumber }]
            : [{ id: correlationId }];

        for (const filtro of filtrosDoHeader) {
            const rotulo = filtro.caseNumber ? "caseNumber" : "id";
            try {
                const resposta = await lerCasosSapCru(calmItsmService, filtro);
                // Por id o Case vem sem envelope (ver DetalheCasoSap); por caseNumber o formato nao
                // e documentado, entao array e {results} tambem sao aceitos.
                const achado = (Array.isArray(resposta) ? resposta[0]
                    : Array.isArray(resposta?.results) ? resposta.results[0]
                        : resposta) || null;

                if (!achado || typeof achado !== "object"
                    || (!achado.id && !achado.caseNumber)) {
                    LOG.warn(`Header do caso ${caseNumber}/${correlationId} veio vazio por `
                        + `${rotulo}.`);
                    continue;
                }

                // Conferir a chave e a UNICA barreira deste GET: ele sai SEM 'reporter' (o escopo
                // foi feito no C4C) e 'caseNumber' nao e filtro documentado no CALM_ITSM.json. Se o
                // tenant ignorar o parametro nao suportado, ou se o campo Z do chamado apontar para
                // outro caso, a ALM devolve um caso de OUTRO cliente e a tela mostraria o numero, o
                // assunto e o status dele no cabecalho - com as bolhas certas, o que esconde o erro.
                // Boolean(caseNumber) na frente: com o numero pendente ("") um caso que voltasse
                // TAMBEM sem numero casaria "" === "" e passaria sem nenhuma conferencia de chave.
                const numeroBate = Boolean(caseNumber)
                    && String(achado.caseNumber ?? "").trim() === caseNumber;
                const idBate = String(achado.id ?? "").trim() === correlationId;

                if (!numeroBate && !idBate) {
                    LOG.warn(`ALM devolveu o caso ${achado.caseNumber || "<sem numero>"}/`
                        + `${achado.id || "<sem id>"} para o filtro ${rotulo} do caso `
                        + `${caseNumber}/${correlationId}: header descartado.`);
                    continue;
                }

                caso = achado;
                headerPorOnde = rotulo;
                break;
            } catch (erro) {
                LOG.warn(`Falha ao ler o header do caso ${caseNumber}/${correlationId} por `
                    + `${rotulo}: ${erro.message}`);
            }
        }

        // BACKFILL do numero: caso aberto cujo GET do numero falhou na hora ficou so com o
        // z_id_sfm_KUT, e o header que acabou de ser lido tem o que falta. Gravar aqui e o que
        // impede o chamado de ficar para sempre com meio vinculo. await de proposito: e uma
        // escrita rara (so quando o campo esta vazio) e soltar a promise engoliria a falha.
        const numeroDoHeader = String(caso?.caseNumber ?? "").trim();
        if (!caseNumber && numeroDoHeader) {
            await gravarCasoSapNoChamado(ticketService, String(linha.ObjectID ?? ""), correlationId,
                numeroDoHeader, `backfill do numero na conversa do chamado ${chamadoId}`);
        }

        // Comentarios sao o essencial da resposta, entao aqui e reject, igual a ComentariosCasoSap.
        let respostaComentarios;
        try {
            respostaComentarios = await lerComentariosCasoSapCru(calmItsmService,
                { id: correlationId });
        } catch (erro) {
            LOG.warn(`Falha ao ler os comentarios do caso ${correlationId} `
                + `(chamado ${chamadoId}): ${erro.message}`);
            return req.reject(502,
                `Nao foi possivel consultar os comentarios do caso: ${erro.message}`);
        }

        const conversa = comentariosCasoSapComoResposta(respostaComentarios);
        const texto = (valor) => String(valor ?? "");

        LOG.info(`Conversa do chamado ${chamadoId} (caso `
            + `${caseNumber || numeroDoHeader || "(sem numero)"}/${correlationId}, escopo `
            + `${campoEscopo}=${contatoId}): header por ${headerPorOnde || "nenhum"}, `
            + `${conversa.exibidos}/${conversa.total} comentarios em ${Date.now() - inicio} ms.`);

        return {
            // Eco dos campos Z do CHAMADO, nao do payload da ALM: sao eles que identificam o
            // caso na tela, e header que falhou nao pode zerar essa identificacao.
            correlationId,
            caseNumber: texto(caso?.caseNumber) || caseNumber,
            subject: texto(caso?.subject),
            status: texto(caso?.status),
            priority: texto(caso?.priority),
            customerNumber: texto(caso?.customerNumber),
            createdAt: texto(caso?.createdAt),
            updatedAt: texto(caso?.updatedAt),
            headerFalha: !caso,
            ...conversa
        };
    });

    // Enriquecimento em LOTE da lista do "Chat com SAP" (funcional e requisitante): a tela ja
    // pintou as linhas com o dado do CHAMADO (numero do campo Z, titulo e data de abertura) e
    // este handler devolve o que so a ALM sabe - numero, assunto e data da ultima mensagem do
    // CASO. A tela nao manda correlationId nenhum, pelo mesmo motivo de
    // ConversaCasoSapDoChamado: id vindo do navegador leria caso de outro cliente do tenant.
    // Custo: 2 GETs na ALM por caso, com teto, 6 em paralelo e cache por correlationId.
    this.on("ConversasCasoSapDoRequisitante", async (req) => {
        const vazio = { total: 0, exibidos: 0, truncado: false, falha: false, conversas: [] };
        const inicio = Date.now();

        // 1) IDENTIDADE - identica a ConversaCasoSapDoChamado: quem decide de quem e a lista e
        // resolverEmailDoEscopoCasoSap (JWT na frente em producao), nunca o req.data.email cru.
        let requisitante;
        try {
            requisitante = await this.send("Requisitante", {
                email: resolverEmailDoEscopoCasoSap(req)
            });
        } catch (erro) {
            LOG.warn(`Falha ao identificar o requisitante das conversas SAP: ${erro.message}`);

            // A tela ja esta pintada com o fallback: envelope vazio, nunca reject.
            return { ...vazio, falha: true, conversas: [] };
        }

        const contatoId = String(requisitante?.contatoId || "").trim();
        // "funcionario" e o literal que o handler Requisitante devolve; "contato" e o outro.
        const ehFuncionario = String(requisitante?.origem || "").trim() === "funcionario";

        // Falha fechada sem identidade: contatoId vazio tiraria o filtro de escopo do SELECT e a
        // varredura leria chamado de qualquer cliente do tenant.
        if (!contatoId) {
            LOG.warn("Conversas SAP sem requisitante identificado (JWT sem attr.email e sem "
                + "e-mail no request, ou e-mail sem contato/funcionario): resposta vazia.");
            return { ...vazio, conversas: [] };
        }

        // Mesmo par do frontend: funcionario interno entra como executor, contato como
        // requisitante.
        const campoEscopo = ehFuncionario
            ? CAMPO_ESCOPO_EXECUTOR_C4C
            : CAMPO_ESCOPO_REQUISITANTE_C4C;

        // 2) CHAMADOS DO USUARIO QUE TEM CASO NA ALM. O filtro pelo campo custom foi MEDIDO neste
        // tenant ($filter=z_id_sfm_KUT ne '' responde 200): sem ele esta varredura leria os
        // chamados todos do usuario para achar um punhado. z minusculo - Z_ maiusculo faz o C4C
        // recusar a requisicao inteira. Paginacao e anti-loop no molde de
        // ClientesDistintosChamados (o orderBy nao e opcional: sem ele o $skip do C4C repete
        // linha).
        const { ServiceRequestCollection } = ticketService.entities;
        const candidatos = [];
        // Dedupe pelo ObjectID e nao pelo ID: ID e Nullable no edmx.
        const vistos = new Set();
        let linhasLidas = 0;
        let paginas = 0;
        let concluido = false;
        let primeiroDaPaginaAnterior = "";
        let falhaVarredura = false;

        try {
            while (paginas < MAXIMO_PAGINAS_CHAMADOS_C4C) {
                const linhas = linhasDaResposta(await ticketService.run(
                    SELECT.from(ServiceRequestCollection)
                        .columns("ID", "ObjectID", "CreationDateTime", "z_case_number_KUT",
                            "z_id_sfm_KUT")
                        .where({ [campoEscopo]: contatoId, z_id_sfm_KUT: { "!=": "" } })
                        // ID desc so PAGINA (unico, e a chave estavel que o $skip exige); ID e
                        // String no C4C, entao quem ordena o corte do teto e CreationDateTime.
                        .orderBy("ID desc")
                        .limit(LIMITE_CHAMADOS_C4C, linhasLidas)
                ));

                paginas += 1;
                linhasLidas += linhas.length;

                for (const linha of linhas) {
                    const chave = String(linha?.ObjectID ?? "").trim()
                        || String(linha?.ID ?? "").trim();
                    const chamadoId = String(linha?.ID ?? "").trim();
                    const correlationId = String(linha?.z_id_sfm_KUT ?? "").trim();
                    const caseNumber = String(linha?.z_case_number_KUT ?? "").trim();

                    // Exige o z_id_sfm_KUT e o ID (a chave de casamento com a linha que a tela ja
                    // pintou), igual a ConversaCasoSapDoChamado. O numero NAO entra na exigencia:
                    // chamado com id e sem numero e exatamente quem precisa do backfill la embaixo,
                    // e descarta-lo aqui deixaria o campo vazio para sempre.
                    if (!chave || !chamadoId || !correlationId) continue;
                    if (vistos.has(chave)) continue;

                    vistos.add(chave);
                    // criadoEm em ms: chamado sem data cai para 0 e fica no fim do corte.
                    candidatos.push({
                        chamadoId,
                        correlationId,
                        caseNumber,
                        // Chave do UPDATE do backfill; o ID visivel nao acha o header no C4C.
                        objectID: String(linha?.ObjectID ?? "").trim(),
                        criadoEm: paraMs(linha?.CreationDateTime) ?? 0
                    });
                }

                const primeiro = String(linhas[0]?.ObjectID ?? linhas[0]?.ID ?? "");
                const paginaRepetida = Boolean(primeiro)
                    && primeiro === primeiroDaPaginaAnterior;
                primeiroDaPaginaAnterior = primeiro;

                // Pagina vazia e o unico fim confiavel: pagina curta tambem pode ser teto do
                // tenant.
                if (!linhas.length) {
                    concluido = true;
                    break;
                }

                // Pagina repetida e $skip ignorado: o resto ficou sem ler, logo truncado.
                if (paginaRepetida) {
                    LOG.warn("ServiceRequestCollection devolveu a mesma pagina duas vezes na "
                        + `varredura das conversas SAP (offset ${linhasLidas - linhas.length}); `
                        + "varredura encerrada.");
                    break;
                }

                if (linhasLidas >= MAXIMO_TOTAL_CHAMADOS_C4C) break;
            }
        } catch (erro) {
            LOG.warn(`Falha ao varrer os chamados com caso SAP (${campoEscopo}=${contatoId}): `
                + erro.message);
            falhaVarredura = true;

            // Parcial ainda enriquece as linhas que ja apareceram; sem candidato nao ha o que ler.
            if (!candidatos.length) return { ...vazio, falha: true, conversas: [] };
        }

        const total = candidatos.length;
        if (!total) return { ...vazio, conversas: [] };

        // 3) TETO. Cortar na ordem da varredura (ID desc, lexicografica) gastaria o teto em chamados
        // velhos e deixaria o topo da tela, que e CreationDateTime desc, todo no fallback.
        candidatos.sort((a, b) => b.criadoEm - a.criadoEm);
        const selecionados = candidatos.slice(0, MAXIMO_CONVERSAS_ENRIQUECIDAS_SAP);
        const truncado = falhaVarredura || !concluido || total > selecionados.length;

        let calmItsmService;
        try {
            calmItsmService = await conectarCalmItsm();
        } catch (erro) {
            LOG.warn(`Falha ao conectar no SAP Cloud ALM para as conversas SAP: ${erro.message}`);
            return { total, exibidos: 0, truncado, falha: true, conversas: [] };
        }

        // 4) ENRIQUECIMENTO. Posicao fixa (os trabalhadores terminam fora de ordem) e indice
        // compartilhado, igual a ChamadosComMensagemNova. 6 em paralelo: e o mesmo knob de 429 da
        // ALM, e a concorrencia MEDIDA sem 429 neste tenant.
        const conversas = new Array(selecionados.length).fill(null);
        let proximo = 0;

        await emParalelo(LOTES_SIMULTANEOS_CHAMADOS_SAP, selecionados.length, async () => {
            while (proximo < selecionados.length) {
                const indice = proximo;
                proximo += 1;

                const { chamadoId, correlationId } = selecionados[indice];
                const dados = await enriquecerConversaCasoSap(calmItsmService, correlationId,
                    `chamado ${chamadoId}`);

                conversas[indice] = { chamadoId, ...dados };
            }
        });

        // 5) BACKFILL DO NUMERO. Chamado cujo z_case_number_KUT ficou vazio na abertura (o GET do
        // numero falhou naquele momento) ja teve o caso lido no enriquecimento acima: grava o
        // numero agora, de graca, em vez de deixar o vinculo pela metade. Em SERIE e nao no
        // trabalhador: sao poucas linhas (so as pendentes) e a escrita no C4C nao pode disputar
        // vaga com as leituras da ALM.
        let numerosGravados = 0;
        for (let indice = 0; indice < selecionados.length; indice += 1) {
            const { objectID, caseNumber, correlationId, chamadoId } = selecionados[indice];
            const numero = String(conversas[indice]?.caseNumber ?? "").trim();

            // Ja tem numero, o caso nao foi lido, ou nao ha chave para o UPDATE: nada a fazer.
            if (caseNumber || !numero || !objectID) continue;

            if (await gravarCasoSapNoChamado(ticketService, objectID, correlationId, numero,
                `backfill do numero na lista de conversas do chamado ${chamadoId}`)) {
                numerosGravados += 1;
            }
        }

        const exibidos = conversas.filter((conversa) => conversa && !conversa.falha).length;

        if (numerosGravados) {
            LOG.info(`Backfill do z_case_number_KUT em ${numerosGravados} chamado(s) de `
                + `${campoEscopo}=${contatoId}.`);
        }

        LOG.info(`Conversas SAP de ${campoEscopo}=${contatoId}: ${exibidos}/${total} enriquecidos `
            + `(${conversas.length} lidos, truncado=${truncado}) em ${Date.now() - inicio} ms.`);

        return {
            total,
            exibidos,
            truncado,
            falha: falhaVarredura || conversas.some((conversa) => conversa && conversa.falha),
            // Caso com falha SOBE na resposta, com os campos vazios: e assim que a tela sabe
            // manter o fallback do chamado naquela linha em vez de apaga-la.
            conversas: conversas.filter(Boolean)
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

    // Lista de anexos do caso: um GET por abertura do detalhe, mesma chave do chat (o
    // correlationId, nunca o caseNumber). Leitura, entao aqui nao ha nada a deduplicar.
    this.on("AnexosCasoSap", async (req) => {
        const correlationId = String(req.data.correlationId || "").trim();
        const sUser = String(req.data.sUser || "").trim();
        const vazio = { total: 0, exibidos: 0, truncado: false, anexos: [] };

        if (!correlationId) {
            return req.reject(400,
                "Informe o correlationId do caso para ler os anexos.");
        }

        // Mesma regra de ComentariosCasoSap: sem reporter a ALM escolheria o escopo sozinha e
        // devolveria anexo de caso de outro usuario; vazio e melhor que consulta aberta.
        if (!sUser) {
            LOG.warn(`Anexos do caso ${correlationId} sem S-User: lista volta vazia.`);
            return vazio;
        }

        // limit explicito: sem ele vale o default nao documentado do servidor.
        const parametros = new URLSearchParams({
            id: correlationId,
            reporter: sUser,
            limit: String(LIMITE_ANEXOS_CASO_SAP)
        });

        let resposta;
        try {
            const calmItsmService = await conectarCalmItsm();
            resposta = await calmItsmService.send({
                method: "GET",
                path: `/supportcases/cases/attachments?${parametros}`
            });
        } catch (erro) {
            LOG.warn(`Falha ao ler os anexos do caso ${correlationId} `
                + `(S-User ${sUser}): ${erro.message}`);
            return req.reject(502,
                `Nao foi possivel consultar os anexos do caso: ${erro.message}`);
        }

        const linhas = Array.isArray(resposta?.results) ? resposta.results : [];

        const anexos = linhas
            .map((linha) => ({
                // idAttachment e a unica chave do download; sem ela a linha nunca baixa.
                idAnexo: String(linha.idAttachment ?? "").trim(),
                nome: String(linha.fileName ?? "").trim(),
                descricao: String(linha.description ?? ""),
                // Normalizado: a ALM manda "pdf" ou "application/pdf" no mesmo campo, e a tela usa
                // este valor como type do Blob no download.
                contentType: mimeTypeDoAnexoDaAlm(linha.contentType, linha.fileName),
                url: String(linha.url ?? ""),
                // Datas cruas da ALM: o parse mora no frontend, como no resto do app.
                criadoEm: String(linha.createdAt ?? ""),
                criadoPor: String(linha.createdBy ?? "")
            }))
            .filter((anexo) => anexo.idAnexo);

        if (anexos.length < linhas.length) {
            LOG.warn(`Caso ${correlationId}: ${linhas.length - anexos.length} anexo(s) sem `
                + `idAttachment ficaram fora da lista (nao teriam download).`);
        }

        // O envelope traz um count que e o tamanho da propria pagina: quem responde "faltou
        // anexo?" e o totalCount contra a PAGINA lida, nao contra exibidos.
        const total = Number(resposta?.totalCount ?? linhas.length);

        return {
            total,
            truncado: total > linhas.length,
            exibidos: anexos.length,
            anexos
        };
    });

    // Download do binario: sai por function porque o adapter V4 apagaria coluna binaria do $select
    // antes do handler (mesmo motivo de ConteudoAnexo, do C4C).
    this.on("AnexoCasoSapConteudo", async (req) => {
        const idAnexo = String(req.data.idAnexo || "").trim();
        const sUser = String(req.data.sUser || "").trim();
        const nome = String(req.data.nome || "").trim();

        if (!idAnexo) {
            return req.reject(400,
                "Informe o identificador do anexo para baixar o arquivo.");
        }

        // Diferente da listagem: sem reporter o GET do binario devolve 428, entao nada de vazio.
        if (!sUser) {
            return req.reject(400,
                "Informe o S-User do requisitante para baixar o anexo.");
        }

        const parametros = new URLSearchParams({ idAttachment: idAnexo, reporter: sUser });

        let resposta;
        try {
            const calmItsmService = await conectarCalmItsm();
            // Sem base64Encoded e com _binary: o send() do CAP devolve so response.data, entao o
            // header X-Base64Encoded seria inacessivel e nao daria para saber a codificacao do
            // corpo. Bytes crus + toString("base64") aqui e deterministico; _binary liga o
            // responseType arraybuffer, sem o qual o axios tentaria JSON.parse e corromperia.
            resposta = await calmItsmService.send({
                // accept proprio: o default do CAP e "application/json,text/plain" (query.js) e este
                // endpoint produz SO application/octet-stream - gateway que honre o Accept devolveria
                // 406. "*/*" e nao "application/octet-stream" de proposito: o Service.js do CAP troca
                // o responseType para "stream" quando o accept casa /stream|image|pdf|tar/, e ai o
                // Buffer.isBuffer abaixo falharia e o anexo desceria corrompido.
                headers: { accept: "*/*" },
                method: "GET",
                path: `/supportcases/attachment?${parametros}`,
                _binary: true
            });
        } catch (erro) {
            // O cliente rest do CAP embrulha tudo em statusCode 502 e joga a resposta original em
            // reason: ler erro.status/erro.response aqui daria 502 em toda falha (client.js:200).
            const respostaErro = erro?.reason?.response;
            const mensagem = mensagemDeErroDaAlm(respostaErro, erro);
            LOG.warn(`Falha ao baixar o anexo ${idAnexo} `
                + `(reporter ${sUser}, nome ${nome || "(sem nome)"}): ${mensagem}`);

            const status = Number(respostaErro?.status ?? erro?.status ?? 0);

            if (status === 400 || status === 428) {
                return req.reject(400,
                    `SAP Cloud ALM recusou a leitura do anexo: ${mensagem}`);
            }

            if (status === 429) {
                return req.reject(429,
                    "SAP Cloud ALM esta limitando as requisicoes. Aguarde e tente novamente.");
            }

            return req.reject(502,
                `Nao foi possivel baixar o anexo do SAP Cloud ALM: ${mensagem}`);
        }

        // Fallback so existe se algum executor devolver string: latin1 preserva 1 byte por char.
        const buffer = Buffer.isBuffer(resposta)
            ? resposta
            : Buffer.from(String(resposta ?? ""), "latin1");

        if (buffer.length === 0) {
            LOG.warn(`Anexo ${idAnexo} (reporter ${sUser}) voltou com corpo vazio da ALM.`);
            return req.reject(502, "SAP Cloud ALM devolveu o anexo vazio.");
        }

        // mimeType vazio de proposito: o header da resposta nao chega ao send(), entao a tela usa
        // o contentType que veio da listagem.
        return { nome, mimeType: "", base64: buffer.toString("base64") };
    });

    // Envio de anexo: DOIS POSTs em sequencia, um arquivo por chamada. O passo (a) sobe o binario
    // para o Document Service e devolve a url; o (b) vincula essa url ao caso. Nenhum dos dois tem
    // chave de deduplicacao, entao NUNCA reenviar - nem apos falha, nem em timeout.
    this.on("EnviarAnexoCasoSap", async (req) => {
        const correlationId = String(req.data.correlationId || "").trim();
        const sUser = String(req.data.sUser || "").trim();
        const installationNumber = String(req.data.installationNumber || "").trim();
        const nome = String(req.data.nome || "").trim();
        const descricao = String(req.data.descricao ?? "").trim();
        const base64 = String(req.data.base64 ?? "").trim();

        // send() cru nao passa pela validacao do CAP: sem isto a ALM devolve 400/428 generico.
        if (!correlationId) {
            return req.reject(400,
                "Informe o correlationId do caso para enviar o anexo.");
        }

        if (!sUser) {
            return req.reject(400,
                "Informe o S-User do requisitante para enviar o anexo.");
        }

        // installation e required no POST do binario: vazio toma 400 sem dizer qual campo faltou.
        if (!installationNumber) {
            return req.reject(400, "Informe o numero da instalacao do ambiente: a SAP exige "
                + "installation para receber anexo.");
        }

        if (!nome) {
            return req.reject(400, "Informe o nome do arquivo do anexo.");
        }

        if (!base64) {
            return req.reject(400, "O arquivo do anexo chegou vazio; escolha o arquivo de novo.");
        }

        // Extensao fora da lista da SAP Note 1277146: a ALM responde 200 com url e descarta o
        // arquivo em silencio, entao recusar aqui e a unica forma de a tela saber.
        const extensao = extensaoDoNomeAnexo(nome);

        if (EXTENSOES_ANEXO_CASO_SAP.indexOf(extensao) < 0) {
            return req.reject(400, `A SAP Cloud ALM nao aceita anexo do tipo ".${extensao}" e `
                + `descartaria o arquivo em silencio.`);
        }

        // Aritmetica e nao Buffer.from: decodificar duplicaria 10 MB na memoria so para medir.
        const tamanhoBytes = Math.floor(
            base64.replace(/[\r\n]/g, "").replace(/=+$/, "").length * 3 / 4);

        if (tamanhoBytes > TAMANHO_MAXIMO_ANEXO_CASO_SAP_BYTES) {
            return req.reject(400, `O arquivo passa de `
                + `${TAMANHO_MAXIMO_ANEXO_CASO_SAP_BYTES / (1024 * 1024)} MB; escolha um arquivo `
                + `menor.`);
        }

        // Os tres campos do array do passo (b) sao required: description vazia toma 400.
        const descricaoFinal = descricao || nome;

        const { limite, corpo } = montarMultipartAnexoSap({
            installation: installationNumber,
            nome,
            tipo: extensao,
            descricao: descricaoFinal,
            base64
        });

        // Trava igual as irmas (SAP_ABRIR/SAP_COMENTAR): so a flag simula. Default invertido em dev
        // ja custou caso REAL sem anexo; cuidado que o cds watch local fala com o tenant PRODUTIVO.
        if (process.env.SAP_ANEXAR_CASO_SIMULADO === "1") {
            // Nunca logar o base64: sao ~13 MB por arquivo.
            LOG.warn(`Modo simulado de anexo no caso SAP ${correlationId}: nenhuma chamada a ALM. `
                + `Arquivo ${nome} (.${extensao}, ${tamanhoBytes} bytes), installation `
                + `${installationNumber}, corpo multipart de ${corpo.length} bytes.`);
            return {
                correlationId,
                anexo: {
                    idAnexo: "",
                    nome,
                    descricao: descricaoFinal,
                    contentType: "",
                    url: `simulado://anexo/${extensao}`,
                    criadoEm: agoraNoFormatoDaAlm(),
                    criadoPor: sUser
                }
            };
        }

        // Debug do log "remote" com este corpo derruba o processo antes de o POST sair: o
        // _logRequest do cliente do CAP faz Object.keys(requestConfig.data) e, com
        // NODE_ENV=production, deepSanitize em cima - num Buffer de ~14 MB sao 14 milhoes de chaves
        // (MEDIDO: 1,3 s e 430 MB so nessa linha). Recusar o envio com mensagem clara e melhor que
        // estourar a memoria do container e derrubar a app inteira para todos os usuarios.
        if (cds.log("remote")._debug) {
            LOG.warn(`Envio do anexo ${nome} recusado: o log 'remote' esta em debug e o corpo `
                + `multipart de ${corpo.length} bytes seria logado byte a byte.`);
            return req.reject(503, "O log 'remote' esta em modo debug e o envio de anexo foi "
                + "bloqueado para nao esgotar a memoria do servidor. Desligue o debug e tente "
                + "novamente.");
        }

        let calmItsmService;
        let resposta;
        try {
            calmItsmService = await conectarCalmItsm();
            // Buffer cru + content-type proprio: o send() nao serializa Buffer e calcula o
            // content-length sozinho. Objeto plano com multipart faria o axios gerar OUTRO
            // boundary, e o corpo ja montado nao casaria com ele.
            resposta = await calmItsmService.send({
                method: "POST",
                path: "/supportcases/attachment?base64Encoded=true",
                data: corpo,
                headers: { "content-type": `multipart/form-data; boundary=${limite}` }
            });
        } catch (erro) {
            // O cliente rest do CAP embrulha tudo em statusCode 502 e joga a resposta original em
            // reason: ler erro.status/erro.response aqui daria 502 em toda falha (client.js:200).
            const respostaErro = erro?.reason?.response;
            const mensagem = mensagemDeErroDaAlm(respostaErro, erro);
            LOG.warn(`Falha ao subir o arquivo ${nome} do caso ${correlationId} `
                + `(installation ${installationNumber}, ${tamanhoBytes} bytes): ${mensagem}`);

            const status = Number(respostaErro?.status ?? erro?.status ?? 0);

            // Nunca reenviar apos falha, nem em timeout: o POST do anexo nao tem chave de
            // deduplicacao, e o arquivo pode ja estar no Document Service.
            if (status === 400 || status === 428) {
                return req.reject(400,
                    `SAP Cloud ALM recusou o arquivo ${nome}: ${mensagem}`);
            }

            if (status === 429) {
                return req.reject(429,
                    "SAP Cloud ALM esta limitando as requisicoes. Aguarde e tente novamente.");
            }

            return req.reject(502,
                `Nao foi possivel enviar o arquivo ${nome} ao SAP Cloud ALM: ${mensagem}`);
        }

        const urlDocumento = String(resposta?.url ?? "").trim();

        if (!urlDocumento) {
            LOG.warn(`SAP Cloud ALM aceitou o arquivo ${nome} (caso ${correlationId}, installation `
                + `${installationNumber}) mas nao devolveu a url do documento.`);
            return req.reject(502, "SAP Cloud ALM aceitou o arquivo mas nao devolveu a URL do "
                + "documento; o anexo nao foi vinculado ao caso.");
        }

        let respostaVinculo;
        try {
            const parametros = new URLSearchParams({ id: correlationId, reporter: sUser });
            // Corpo vai em data e como objeto: aqui o CAP serializa e marca application/json.
            respostaVinculo = await calmItsmService.send({
                method: "POST",
                path: `/supportcases/cases/attachments?${parametros}`,
                data: [{ fileName: nome, description: descricaoFinal, url: urlDocumento }]
            });
        } catch (erro) {
            const respostaErro = erro?.reason?.response;
            const mensagem = mensagemDeErroDaAlm(respostaErro, erro);
            const status = Number(respostaErro?.status ?? erro?.status ?? 0);

            // Nunca reexecutar o passo (a): o binario ja subiu e um retry duplicaria o documento.
            if (status === 400 || status === 428) {
                LOG.warn(`Vinculo do arquivo ${nome} ao caso ${correlationId} recusado: `
                    + `${mensagem}`);
                return req.reject(400,
                    `SAP Cloud ALM recusou o vinculo do arquivo ${nome} ao caso: ${mensagem}`);
            }

            if (status === 429) {
                LOG.warn(`Vinculo do arquivo ${nome} ao caso ${correlationId} barrado por limite `
                    + `de requisicoes; o arquivo ficou orfao no Document Service.`);
                return req.reject(429,
                    "SAP Cloud ALM esta limitando as requisicoes. Aguarde e tente novamente.");
            }

            LOG.warn(`Arquivo ${nome} subiu para o Document Service (${urlDocumento}) mas o `
                + `vinculo ao caso ${correlationId} nao foi confirmado: pode ter ficado ORFAO na `
                + `SAP - ou vinculado sem a resposta chegar. ${mensagem}`);
            // Desfecho INDETERMINADO (timeout/5xx): diferente das recusas acima, o vinculo pode ter
            // sido gravado na ALM sem a resposta voltar. A mensagem nao pode convidar ao reenvio
            // cego - sem chave de deduplicacao e sem DELETE de anexo na API, repetir duplicaria o
            // arquivo no caso para sempre.
            return req.reject(502, `Nao houve confirmacao do vinculo do arquivo ${nome} ao caso `
                + `${correlationId}: ele PODE ja estar anexado. Confira a lista de anexos do caso `
                + `antes de enviar de novo. ${mensagem}`);
        }

        // Id vazio nao desfaz o vinculo: ecoar a chave e melhor que a tela dizer que nao enviou.
        const idCaso = String(respostaVinculo?.id ?? "").trim() || correlationId;

        LOG.info(`Anexo enviado ao caso SAP ${idCaso}: ${nome} (.${extensao}, ${tamanhoBytes} `
            + `bytes, reporter ${sUser}, installation ${installationNumber}).`);

        return {
            correlationId: idCaso,
            // idAnexo vazio: o vinculo devolve so o id do CASO. Quem quiser o idAttachment rele a
            // listagem (AnexosCasoSap), que e o que a tela faz depois do envio.
            anexo: {
                idAnexo: "",
                nome,
                descricao: descricaoFinal,
                contentType: "",
                url: urlDocumento,
                criadoEm: agoraNoFormatoDaAlm(),
                criadoPor: sUser
            }
        };
    });

    // Encerramento do caso: 1 PATCH, mesma chave do chat (o correlationId, nunca o caseNumber).
    // O caminho REAL nunca foi exercitado - o tenant e PRODUTIVO e Confirmed fecha caso de cliente
    // sem desfazer, entao a validacao saiu toda pelo SAP_ENCERRAR_CASO_SIMULADO.
    this.on("EncerrarCasoSap", async (req) => {
        const correlationId = String(req.data.correlationId || "").trim();
        const sUser = String(req.data.sUser || "").trim();

        // send() cru nao passa pela validacao do CAP: sem isto a ALM devolve 400/428 generico.
        if (!correlationId) {
            return req.reject(400,
                "Informe o correlationId do caso para encerrar.");
        }

        // reporter e required no PATCH: vazio agiria fora de escopo ou daria 428.
        if (!sUser) {
            return req.reject(400,
                "Informe o S-User do requisitante para encerrar o caso.");
        }

        const corpo = { status: STATUS_CASO_SAP_ENCERRADO };

        // Flag propria, como nas irmas: quem testa encerramento nao quer travar tambem os envios.
        if (process.env.SAP_ENCERRAR_CASO_SIMULADO === "1") {
            LOG.warn(`Modo simulado de encerramento do caso SAP ${correlationId}: nenhuma chamada a `
                + `ALM. Corpo montado: ${JSON.stringify(corpo)}`);
            return { correlationId, status: STATUS_CASO_SAP_ENCERRADO };
        }

        const parametros = new URLSearchParams({ id: correlationId, reporter: sUser });

        let resposta;
        try {
            const calmItsmService = await conectarCalmItsm();
            // Corpo vai em data: no kind rest a chave "body" seria ignorada pelo send().
            resposta = await calmItsmService.send({
                method: "PATCH",
                path: `/supportcases/cases?${parametros}`,
                data: corpo
            });
        } catch (erro) {
            // O cliente rest do CAP embrulha tudo em statusCode 502 e joga a resposta original em
            // reason: ler erro.status/erro.response aqui daria 502 em toda falha (client.js:200).
            const respostaErro = erro?.reason?.response;
            const mensagem = respostaErro?.body?.error?.message || erro.message;
            LOG.warn(`Falha ao encerrar o caso SAP ${correlationId} `
                + `(reporter ${sUser}): ${mensagem}`);

            const status = Number(respostaErro?.status ?? erro?.status ?? 0);

            // 403 do patchCase nao e erro do app: a ALM so libera mudanca de status quando o caso
            // esta em Customer Action / Partner-Customer Action, e o usuario precisa saber disso.
            if (status === 403) {
                return req.reject(403, "SAP Cloud ALM so permite encerrar o caso quando ele esta "
                    + `em "Customer Action" ou "Partner-Customer Action". ${mensagem}`);
            }

            if (status === 400 || status === 428) {
                return req.reject(400,
                    `SAP Cloud ALM recusou o encerramento: ${mensagem}`);
            }

            if (status === 429) {
                return req.reject(429,
                    "SAP Cloud ALM esta limitando as requisicoes. Aguarde e tente novamente.");
            }

            return req.reject(502,
                `Nao foi possivel encerrar o caso no SAP Cloud ALM: ${mensagem}`);
        }

        // Id vazio nao reabre o caso: ecoar a chave e melhor que a tela dizer que nao encerrou.
        const idCaso = String(resposta?.id ?? "").trim() || correlationId;

        LOG.info(`Caso SAP ${idCaso} encerrado (reporter ${sUser}, status `
            + `${STATUS_CASO_SAP_ENCERRADO}).`);

        return { correlationId: idCaso, status: STATUS_CASO_SAP_ENCERRADO };
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