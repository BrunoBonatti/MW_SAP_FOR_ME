using { employeeanduser as employeeApi } from './external/employeeanduser';
using { contact as contactApi } from './external/contact';
using { ticket as ticketApi } from './external/ticket';
using { changedoclist as changedoclistApi } from './external/changedoclist';

// O parser de corpo do CAP usa o default do express (100kb): MEDIDO neste projeto que um POST
// de anex80KB de arquivo ja volta 413 "request entity too large" antes de qualquer
// handler rodar - eo com  o mesmo vale para o $batch que o modelo V4 do app usa. O base64 ainda
// infla ~33% sobre o arquivo, entao 15mb cobre com folga o teto de 10 MB que o FileUploader
// aplica na selecao.
@cds.server.body_parser.limit: '15mb'
@path: '/employee'
service IntegrationService {
  @readonly
  entity Employees as projection on employeeApi.EmployeeCollection;

  @readonly
  entity Contacts as projection on contactApi.ContactCollection;

  // Leitura + criação + atualização de status (via handler UPDATE em app-service.js).
  // Delete continua bloqueado (405) até haver caso de uso.
  @Capabilities.UpdateRestrictions.Updatable: true
  @Capabilities.DeleteRestrictions.Deletable: false
  @Capabilities.CountRestrictions.Countable: false
  entity ServiceRequests as projection on ticketApi.ServiceRequestCollection;

  // Notas do chamado (a descrição viaja aqui: a ServiceRequestCollection não tem campo de
  // texto próprio). Precisa estar exposta para a associação ServiceRequestTextCollection
  // aparecer no $metadata V4 — sem o alvo no serviço o CAP omite a navegação e o deep
  // create do app não teria como enviar a descrição. O handler em app-service.js processa
  // a criação de notas individuais (mensagens do chat) depois que o chamado existe.
  // Sem @cds.persistence.skip: false aqui — forçar persistência quebra o `cds build
  // --production` (o alvo remoto da associação é skip, e o build de HANA rejeita a
  // navegação). MEDIDO: o $metadata V4 sai byte a byte igual sem a anotação, e o READ/CREATE
  // desta entidade tem handler próprio em app-service.js, então nada lê de tabela.
  @Capabilities.UpdateRestrictions.Updatable: false
  @Capabilities.DeleteRestrictions.Deletable: false
  entity ServiceRequestTexts as projection on ticketApi.ServiceRequestTextCollectionCollection;

  // Anexos do chamado. Leitura + criação, no mesmo desenho de ServiceRequests: o upload
  // chega como um POST próprio (ParentObjectID do chamado + Name/MimeType/Binary), não como
  // deep insert, porque o arquivo é escolhido depois de o chamado existir.
  @Capabilities.UpdateRestrictions.Updatable: false
  @Capabilities.DeleteRestrictions.Deletable: false
  entity ServiceRequestAttachmentFolders as projection on ticketApi.ServiceRequestAttachmentFolderCollection;

  // Shape que o Select de cliente do app já consome (key/text). Mantido enxuto de
  // propósito: o codelists.json que ele lia antes tinha só estes dois campos.
  type Cliente {
    code      : String;
    descricao : String;
  }

  // Nome do requisitante + as contas dele. Nome, contatoId e os AccountIDs saem da MESMA
  // resposta de ContactQueryByElements (que filtra por e-mail e repete o contato uma vez
  // por conta); a descricao dos clientes vem de uma segunda consulta (AccountCollection do
  // c4codata, campo AccountName), com o AccountFormattedName do contato como fallback se
  // ela falhar. O type não pode se chamar Requisitante: no CDS types e functions dividem
  // o mesmo namespace, e o nome bom fica com a operação que o app chama.
  type DadosRequisitante {
    nome      : String;
    // ContactID do C4C do requisitante: o app o envia como BuyerMainContactPartyID no
    // create do chamado, para o C4C amarrar o contato solicitante sem nova consulta.
    // Quando o requisitante vem da EmployeeCollection, aqui vai o BusinessPartnerID dele.
    contatoId : String;
    clientes  : array of Cliente;
    // Qual das duas fontes respondeu pelo e-mail: 'contato' (ContactQueryByElements, único
    // caminho que preenche clientes) ou 'funcionario' (EmployeeCollection, consultada só
    // quando não há contato). Vazio = nenhuma das duas achou; o handler não rejeita nesse
    // caso, quem bloqueia a tela continua sendo o frontend.
    origem    : String;
  }

  // Não é projection: o achatamento/dedupe das contas acontece no handler, não no modelo.
  function Requisitante(email : String) returns DadosRequisitante;

  // Conteudo de UM anexo, lido so no clique de download. Nao da para servir o arquivo por GET
  // em ServiceRequestAttachmentFolders: o adapter V4 do CAP apaga toda coluna cds.LargeBinary do
  // $select ANTES do handler (streamProp.handleStreamProperties, chamado no read.js do adapter),
  // entao o Binary nunca chegaria ao C4C nem voltaria ao browser. Anotar @Core.MediaType
  // resolveria a leitura e quebraria o upload: o Binary viraria Edm.Stream no $metadata e o
  // create do app manda Binary como propriedade JSON.
  type ConteudoAnexo {
    nome     : String;
    mimeType : String;
    // base64 cru do C4C, repassado sem decodificar: o cliente odata-v2 do CAP nao converte
    // Edm.Binary na RESPOSTA (so no payload de saida), entao virar Buffer aqui so duplicaria
    // o arquivo na memoria.
    base64   : LargeString;
  }

  function AnexoConteudo(objectID : String) returns ConteudoAnexo;

  @readonly
  entity ChangeDocuments as projection on changedoclistApi.ChangeDocumentCollection;

  // Interacoes do chamado: segunda fonte de mensagens/interacoes que complementam as notas.
  // Retorna um array normalizado: autor resolvido (UUID → nome), data em formato bruto (parse
  // no frontend via _paraIsoLocal como as notas), texto filtrado (sem vazios).
  type InteracaoChamado {
    texto  : String;
    quando : String;
    autor  : String;
  }

  function InteracoesDoChamado(objectID : String) returns { interacoes : array of InteracaoChamado };

  type ChamadoParaChecar {
    ticketId : String;
    objectID : String;
  }

  // "action", nao "function": um parametro Collection(ComplexType) nao da pra codificar numa URL
  // GET (o jeito que function exige no OData V4) - action manda o corpo em POST, que suporta
  // isso. Sem efeito colateral (so leitura), mas o formato do parametro obriga essa escolha.
  // So NOTAS (ServiceRequestTextCollection) - interacoes nao tem campo de volta pro chamado na
  // entidade plana (ServiceRequestInteractionInteractionsCollection), entao nao da pra checar em
  // lote. Devolve so os ticketIds com nota nova (TypeCode 10007/10008) desde a ultima
  // visualizacao guardada em ChatVisualizacoes (db/schema.cds), ou nunca visualizados.
  action ChamadosComMensagemNova(email : String, chamados : array of ChamadoParaChecar)
    returns { ticketIds : array of String };

  action MarcarChatVisualizado(email : String, ticketId : String) returns Boolean;

  type ComponenteSap {
    id        : String;
    chave     : String;
    descricao : String;
    produto   : String;
    obsoleto  : Boolean;
  }

  function ComponentesSap(busca : String) returns {
    total       : Integer;
    exibidos    : Integer;
    componentes : array of ComponenteSap;
  };

  // PATCH isolado do campo custom do header: nao passa pelo handler UPDATE de ServiceRequests
  // (que so libera mudanca de status 5/6) e nunca rejeita, para nao derrubar o chamado ja aberto.
  action AtualizarComponenteChamado(objectID : String, componenteId : String) returns {
    atualizado   : Boolean;
    componenteId : String;
    falha        : Boolean;
    mensagem     : String;
  };

  // Unica escrita do app na SAP Cloud ALM: action e nao function porque function vira GET no V4
  // (cacheavel/repetivel) e uma repeticao criaria um caso REAL duplicado no backbone da SAP.
  action AbrirCasoSap(
    prioridade         : String,
    componenteId       : String,
    customerNumber     : String,
    installationNumber : String,
    systemNbr          : String,
    titulo             : String,
    descricao          : String,
    sUserCliente       : String,
    sUserRequisitante  : String
  ) returns {
    correlationId  : String;
    caseNumber     : String;
    // GET de leitura do numero falhou ou veio vazio: o caso EXISTE, so o numero nao chegou.
    numeroPendente : Boolean;
  };

  // installationNbr/systemNbr sao o dado util do chamado; o resto so orienta o usuario na ajuda de valor.
  type AmbienteSap {
    installationNbr : String;
    systemNbr       : String;
    systemName      : String;
    systemType      : String;
    systemId        : String;
  }

  function AmbientesSap(customerNumber : String) returns {
    total     : Integer;
    exibidos  : Integer;
    ambientes : array of AmbienteSap;
  };

  // CustomerSet da ALM nao tem nome completo nem telefone unico: concatenacao e escolha ficam no handler.
  type ContatoSUser {
    sUser        : String;
    nome         : String;
    // Separado de nome: o Reporter da tela exibe so o primeiro nome ao lado do S-User.
    primeiroNome : String;
    email        : String;
    telefone     : String;
  }

  function ContatoSap(email : String) returns ContatoSUser;

  // ContactID evita o homonimo do nome; nome so como fallback de chamado antigo sem o ID.
  // Sem customerNumber: o S-User do requisitante e sempre buscado no customer da ALM.
  function ContatoSapDoRequisitante(contatoId : String, nome : String) returns ContatoSUser;

  // O z_customer_number_KUT é campo custom fora de qualquer EDMX importado e vive na
  // BusinessPartnerCollection, com $expand=CorporateAccount porque o tenant às vezes só o
  // preenche na conta corporativa. Type não pode se chamar ClienteSap (namespace compartilhado
  // com a function, como em DadosRequisitante).
  type DadosClienteSap {
    // Eco da chave: no lote o C4C nao garante ordem, e a tela precisa casar linha com numero.
    businessPartnerId : String;
    customerNumber    : String;
    nome              : String;
    // Consulta que caiu vs. parceiro sem o campo: os dois devolvem vazio, e a tela precisa
    // separar os dois para nao acusar o cadastro do cliente por uma queda do C4C.
    falha             : Boolean;
  }

  function ClienteSap(businessPartnerId : String) returns DadosClienteSap;

  // Lote da carga da lista: uma chamada por chamado multiplicaria o GET cru pela tabela toda.
  // falha e da consulta inteira; parceiro sem cadastro so nao volta na lista.
  function ClientesSap(businessPartnerIds : String) returns {
    falha    : Boolean;
    clientes : array of DadosClienteSap;
  };

  // Duas chamadas por consulta: cases/ids devolve so o correlationId, e caseNumber/subject
  // existem apenas no GET de detalhe (um por caso). Type nao pode se chamar como a function.
  type CasoSap {
    correlationId : String;
    caseNumber    : String;
    subject       : String;
  }

  // Uma passada so em cases/ids: a consulta roda na abertura do dialogo e cada detalhe ja e uma
  // chamada; paginar multiplicaria o custo e o risco de 429 no caminho do usuario.
  function CasosSapDoRequisitante(customerNumber : String, sUser : String) returns {
    total    : Integer;
    exibidos : Integer;
    // Separado de exibidos < total: detalhe ilegivel tambem encurta a lista, e so aqui a tela
    // sabe que faltou caso por teto (dai o aviso de truncado).
    truncado : Boolean;
    casos    : array of CasoSap;
  };

  // customerNumber por caso porque a tela junta os casos de vários clientes na mesma tabela.
  type CasoSapDoChamado {
    correlationId  : String;
    caseNumber     : String;
    subject        : String;
    customerNumber : String;
  }

  // Composição da tela SAP: os clientes saem dos PRÓPRIOS chamados (ClientesDistintosChamados,
  // que lê ID + BuyerPartyID e resolve o z_customer_number_KUT), não do master data da ALM.
  function CasosSapDosChamados(contatoId : String, executor : Boolean,
                               sUser : String, atualizar : Boolean) returns {
    clientes : Integer;
    total    : Integer;
    exibidos : Integer;
    // Varredura de chamados cortada, teto de casos ou teto de detalhes: os três somem caso da
    // tabela, e sem o flag a tela afirmaria que o requisitante tem menos caso do que tem.
    truncado : Boolean;
    // Parcial por falha de uma das fases; a lista ainda vale, mas não é o conjunto completo.
    falha    : Boolean;
    casos    : array of CasoSapDoChamado;
  };

  // Chamada própria e não mais campos em CasoSapDoChamado: o payload completo só vem no GET de
  // detalhe (um por caso), e carregá-lo para a tabela inteira só para exibir uma linha é caro.
  type CasoSapDetalhe {
    // Eco da chave pedida: a tela precisa casar o detalhe com a linha que o abriu.
    correlationId      : String;
    caseNumber         : String;
    subject            : String;
    // HTML repassado CRU, sem escapar: quem filtra as tags é o FormattedText do sap.m.
    description        : LargeString;
    businessImpact     : LargeString;
    priority           : String;
    status             : String;
    product            : String;
    productFunction    : String;
    customer           : String;
    customerNumber     : String;
    reporter           : String;
    systemName         : String;
    systemId           : String;
    systemNbr          : String;
    installationNumber : String;
    supportType        : String;
    language           : String;
    connectionLink     : String;
    // Data crua da ALM: o parse fica no frontend, como no resto do app.
    createdAt          : String;
    updatedAt          : String;
    closedAt           : String;
    createdBy          : String;
    lastUpdatedBy      : String;
  }

  // sUser obrigatório: o GET de detalhe da ALM exige o reporter, e sem ele a consulta sairia aberta.
  function DetalheCasoSap(correlationId : String, sUser : String) returns CasoSapDetalhe;

  // Bolha do chat SAP: autor so existe como S-User (createdBy) e tipo e o unico discriminador de
  // direcao. Singular porque o plural e o nome da function (namespace compartilhado).
  type ComentarioCasoSap {
    texto  : String;
    quando : String;
    autor  : String;
    tipo   : String;
  }

  // Um GET por clique na lista: o limit fecha a conversa numa chamada so, sem paginar. A chave do
  // endpoint e o correlationId (nao o caseNumber), o mesmo id que o GET de detalhe usa.
  function ComentariosCasoSap(correlationId : String, sUser : String) returns {
    total       : Integer;
    exibidos    : Integer;
    // Sem o flag a tela afirmaria que o caso tem menos comentario do que tem.
    truncado    : Boolean;
    comentarios : array of ComentarioCasoSap;
  };

  // Action e nao function pelo mesmo motivo de AbrirCasoSap: function vira GET (repetivel) e o
  // CommentPost nao tem chave de deduplicacao nem delete, entao a repeticao grava em dobro.
  action EnviarComentarioCasoSap(
    correlationId : String,
    sUser         : String,
    texto         : String
  ) returns {
    // Eco do CaseIdResponse.id: a tela casa a resposta com a conversa ainda aberta.
    correlationId : String;
    // A ALM devolve so o id, entao a bolha e montada aqui para dispensar um GET apos o POST.
    comentario    : ComentarioCasoSap;
  };

  // z_customer_number_KUT vem do BuyerPartyID (BusinessPartnerCollection), nunca do chamado.
  type ClienteDistintoChamado {
    customerNumber : String;
    chamados       : Integer;
  }

  // contatoId obrigatorio: sem ele a varredura leria o tenant inteiro. executor escolhe o campo do
  // filtro, como o _sCampoEscopoChamado da tela.
  function ClientesDistintosChamados(contatoId : String, executor : Boolean,
                                     atualizar : Boolean) returns {
    chamadosLidos     : Integer;
    chamadosTotal     : Integer;
    semCustomerNumber : Integer;
    distintos         : Integer;
    clientes          : array of ClienteDistintoChamado;
    truncado          : Boolean;
    falhaClientes     : Boolean;
    // Mensagem crua do C4C: "0 clientes" sozinho nao revela a causa.
    erroClientes      : String;
  };
}