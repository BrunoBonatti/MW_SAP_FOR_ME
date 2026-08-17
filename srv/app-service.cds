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

  // Entra pelo NOME porque e so isso que o detalhe do chamado tem do requisitante
  // (BuyerMainContactPartyName); o e-mail que a ALM exige o handler resolve no C4C.
  // Sem customerNumber porque o S-User do requisitante e sempre buscado no customer da ALM.
  function ContatoSapPorNome(nome : String) returns ContatoSUser;

  // ALM devolve so correlationId; customerNumber vem do escopo e a leitura do detalhe exige os dois.
  type ChamadoSapId {
    correlationId  : String;
    customerNumber : String;
  }

  // atualizar ignora o cache de 5 min do handler; e o que o botao de refresh da tela usa.
  function ChamadosSap(sUser : String, atualizar : Boolean) returns {
    total    : Integer;
    exibidos : Integer;
    chamados : array of ChamadoSapId;
  };
}