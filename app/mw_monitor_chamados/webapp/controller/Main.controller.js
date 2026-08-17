sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/base/Log",
    "megawork/mwmonitorchamados/model/formatter"
], (Controller, MessageBox, MessageToast, Device, JSONModel, Filter, FilterOperator, Sorter, Log, formatter) => {
    "use strict";

    const PRIORIDADE_CHAMADO_PARA_C4C = {
        IMEDIATA: "1",
        URGENTE: "2",
        NORMAL: "3",
        BAIXA: "7"
    };

    // Inverso do mapa acima: o dialogo SAP herda a prioridade do chamado que esta sendo escalado,
    // porque nascer sempre em "Baixa" abriria o caso na SAP com o SLA errado desde a criacao.
    const PRIORIDADE_CHAMADO_DO_C4C = {
        1: "IMEDIATA",
        2: "URGENTE",
        3: "NORMAL",
        7: "BAIXA"
    };

    // Prioridade do chamado por pontuacao: o cliente marca opcoes (MultiComboBox) de "Ambiente/sistema
    // afetado" e "O que pode ser afetado" (codelists>/areasAfetadasChamado e
    // .../tiposImpactoChamado, cada opcao com um peso). A soma dos pesos marcados e enquadrada
    // aqui numa faixa; a Prioridade resultante e o que vai no ServicePriorityCode do C4C (ver
    // PRIORIDADE_CHAMADO_PARA_C4C) e some do resumo da tela. Calculada no wizard, nunca
    // escolhida pelo cliente diretamente (ver onAreasImpactoChange).
    const FAIXAS_PRIORIDADE_POR_PONTUACAO = [
        { min: 9, prioridade: "IMEDIATA" },
        { min: 7, prioridade: "URGENTE" },
        { min: 4, prioridade: "NORMAL" },
        { min: 0, prioridade: "BAIXA" }
    ];

    // Timeline: WHITELIST de ObjectNodeElementName -> rótulo exibido na Timeline.
    // Reproduz a aba "Alterações" do Sales Cloud: dos ~74 registros técnicos que o
    // /ChangeDocuments devolve, SO os nomes desta tabela viram linha. Qualquer outro nome é
    // descartado (ver _resolverAtributoAlteracaoC4C).
    // Text/content fica FORA de proposito: duplica FormattedText/content (o mesmo
    // "TES EDI CHAT" chega nos dois) e o Sales Cloud mostra uma alteracao so.
    // Status/RequestAssignmentStatusCode fica FORA: nao aparece na aba "Alteracoes" do Sales Cloud.
    const MAPA_ATRIBUTOS_ALTERACOES_C4C = {
        "FormattedText/content": "Resposta do cliente",
        "ChangedByCustomerIndicator": "Cliente atualizado",
        "BusinessTransactionDocumentReference/ID/content": "ID do documento de referência",
        "BusinessTransactionDocumentReference/TypeCode": "Tipo de documento de referência",
        "AddressReference/AddressHostUUID/content": "Endereço da parte",
        "ServiceOrganisationID": "Equipe",
        "HorasMegawork": "Horas Megawork",
        "Tst": "Tst",
        "AlternativeName": "Título do anexo",
        "Name": "Nome do arquivo anexo",
        "Status/ServiceRequestLifeCycleStatusCode": "Status interno",
        "ServiceRequestUserLifeCycleStatusCode": "Status"
    };

    // Timeline: o nome do campo de data é sempre o mesmo ("TimePoint/DateTime/content"); quem diz
    // QUAL data é o TimePointRoleCode do nó TimePointTerms(UUID) irmão. Role fora deste mapa
    // (841, por exemplo) não é exibido - ver _normalizarMudancasComoAlteracoesC4C.
    const MAPA_TIMEPOINT_ROLE_CODE = {
        "843": "Resposta pelo cliente em",
        "842": "Resposta pelo agente em"
    };

    const CAMPO_TIMEPOINT_DATA = "TimePoint/DateTime/content";
    const CAMPO_TIMEPOINT_ROLE = "TimePointRoleCode/content";

    // Timeline: códigos de BusinessTransactionDocumentReference/TypeCode. Código sem entrada aqui
    // é exibido cru (só o número), nunca escondido.
    const MAPA_TIPO_DOCUMENTO_REFERENCIA_C4C = {
        "2574": "Atividade de nota"
    };

    // Timeline: códigos de Status/ServiceRequestLifeCycleStatusCode. Saída é "código-descrição".
    // Código sem entrada aqui ainda é exibido (cru).
    const MAPA_STATUS_INTERNO = {
        "1": "Aberto",
        "4": "Fechado"
    };

    // Timeline: códigos de ServiceRequestUserLifeCycleStatusCode. Saída é "código-descrição".
    // Código sem entrada aqui ainda é exibido (cru). DIFERENTE do mapa de Status interno.
    const MAPA_STATUS_CHAMADO = {
        "1": "Novo",
        "6": "Fechado"
    };

    // Tipo travado por decisao do negocio: todo chamado do wizard sobe como SRRQ. O wizard nao
    // oferece escolha de tipo, entao nao ha mapa de UI para code do C4C.
    const PROCESSING_TYPE_CODE_C4C = "SRRQ";

    const TYPE_CODE_DESCRICAO_C4C = "10004";

    const MAX_TICKETS_LISTA = 100;

    // Teto de notas lidas por chamado (o chat nao tem paginacao). A leitura vem do mais NOVO
    // para o mais antigo, entao o corte descarta a conversa velha.
    const MAX_NOTAS_CHAT = 200;

    // Teto de mudanças lidas por chamado, também do mais NOVO para o mais antigo.
    // No tenant, um chamado com duas edições já produz 70 registros.
    const MAX_MUDANCAS_HISTORICO = 200;

    // Teto de anexos lidos por chamado, do mais NOVO para o mais antigo (a aba nao pagina).
    const MAX_ANEXOS_CHAMADO = 100;

    // Teto de arquivos por selecao (wizard e detalhe): cada um vai num POST proprio de ~13,4 MB
    // (base64 infla 33% sobre os 10 MB permitidos), e o C4C recebe um por vez.
    const MAX_ANEXOS_PENDENTES = 5;

    const MIME_TYPE_PADRAO_ANEXO = "application/octet-stream";

    // Extensoes aceitas e teto por arquivo. A validacao mora AQUI e nao em
    // fileType/maximumFileSize do FileUploader: o _areFilesAllowed do controle reprova a SELECAO
    // INTEIRA no primeiro ofensor e o handlechange volta sem disparar o change (com
    // sameFilenameAllowed o setValue("") tambem nao o refaz), entao um .exe escolhido junto com
    // dois prints levaria os prints embora, calado. Sao as extensoes que fmt.anexoIcone iconiza.
    const EXTENSOES_ANEXO = ["png", "jpg", "jpeg", "gif", "bmp", "pdf", "doc", "docx", "xls",
        "xlsx", "csv", "txt", "log", "zip", "rar", "7z"];
    const MAX_BYTES_ANEXO = 10 * 1024 * 1024;

    // TypeCodeText no tenant: 10004=Case Description, 10007=Reply to Customer, 10008=Reply from
    // Customer. 10011 (Internal Comment) e 10022 (Service Response Reports) ficam fora: sao internos.
    const TYPE_CODE_RESPOSTA_ATENDIMENTO_C4C = "10007";
    const TYPE_CODE_RESPOSTA_REQUISITANTE_C4C = "10008";
    const TYPE_CODES_CHAT_C4C = [
        TYPE_CODE_DESCRICAO_C4C,
        TYPE_CODE_RESPOSTA_ATENDIMENTO_C4C,
        TYPE_CODE_RESPOSTA_REQUISITANTE_C4C
    ];

    // Fonte que identificou o usuario na function Requisitante: "contato" veio da
    // ContactQueryByElements (traz as empresas vinculadas), "funcionario" veio do fallback pela
    // EmployeeCollection com o mesmo e-mail (nao tem AccountID, logo nunca traz empresa) e ""
    // significa que nenhuma das duas fontes achou o e-mail.
    const ORIGEM_REQUISITANTE_FUNCIONARIO = "funcionario";

    // Papel pelo qual o usuario aparece no chamado, e portanto o campo que escopa a lista: contato
    // do C4C entra como REQUISITANTE, funcionario interno entra como EXECUTOR do atendimento.
    const CAMPO_ESCOPO_REQUISITANTE = "BuyerMainContactPartyID";
    const CAMPO_ESCOPO_EXECUTOR = "ServicePerformerPartyID";

    // PROVISORIO (homologacao): e-mail assumido no lugar do usuario do shell quando o botao
    // "e-mail local" do ToolHeader esta ligado. Trocar o valor aqui para testar como outro
    // requisitante. Sai junto com o botao quando o app for para producao.
    const EMAIL_LOCAL_DEV = "bruno.bonatti@megawork-gft.com.br";

    const EMAIL_LOCAL_DEV_EDI = "edislaine.silva@megawork.com";

    const EMAIL_LOCAL_DEV_PCOE = "basis.pcoe@megawork.com";

    const EMAILS_DEV_POR_BOTAO = {
        emailLocalButton: EMAIL_LOCAL_DEV,
        emailEdiButton: EMAIL_LOCAL_DEV_EDI,
        emailPcoeButton: EMAIL_LOCAL_DEV_PCOE
    };

    const NOVO_CHAMADO_DEFAULTS = {
        cliente: "",
        contato: "",
        titulo: "",
        prioridade: "BAIXA",
        areasAfetadas: [],
        tiposImpacto: [],
        descricao: "",
        anexos: [],
        // {id, chave, descricao} do componente escolhido em onSelecionarComponenteSap, ou null
        // se o requisitante nao selecionou nenhum (campo opcional).
        componenteSap: null
    };

    const WIZARD_ID = "wizardCriarChamado";
    const PASSO_CLASSIFICACAO = 1;
    const PASSO_DETALHES = 2;
    const TOTAL_PASSOS_WIZARD = 4;
    const IDS_PASSOS_WIZARD = ["stepClassificacao", "stepDetalhes", "stepAnexo", "stepRevisao"];


    // Cockpit (Home). Mesmo escopo da aba "Acompanhar Chamados", requisitante ou executor
    // conforme a origem - ver _getCampoEscopoChamado.
    const COCKPIT_STATUS_ABERTO = ["1", "4"]; // Novo, Ação do Cliente
    const COCKPIT_STATUS_EM_ANDAMENTO = ["2"]; // Em Processamento
    const COCKPIT_STATUS_FECHADO = ["6"]; // Fechado
    const COCKPIT_PRIORIDADES_URGENTES = [PRIORIDADE_CHAMADO_PARA_C4C.IMEDIATA, PRIORIDADE_CHAMADO_PARA_C4C.URGENTE];

    // Traducao PT-BR pelo CODE (confiavel), nao pelo *CodeText que o tenant devolve em ingles.
    // So a lista de recentes do cockpit usa isso: a aba "Acompanhar Chamados" decidiu de
    // proposito nao traduzir e mostra o *CodeText cru.
    const COCKPIT_PRIORIDADE_TEXTO = {
        "1": "Imediata",
        "2": "Urgente",
        "3": "Normal",
        "7": "Baixa"
    };
    const MAX_CHAMADOS_RECENTES = 5;
    // Teto de registros buscados para montar o cockpit (sem $count, ver _buscarChamadosCockpit).
    // 999 cobre a paginacao padrao do C4C/CAP (limite de 1000).
    const LIMITE_CONTAGEM_COCKPIT = 999;

    // Campos que uma linha de tickets>/Tickets precisa para a tabela e o detalhe funcionarem.
    // Compartilhado por _carregarTickets (a lista toda) e _carregarChamadoPorId (uma linha so):
    // se os dois divergirem, a linha inserida pelo cockpit aparece com campos vazios.
    const SELECT_CHAMADO_LISTA = "ID,ObjectID,Name,ProcessingTypeCode,ProcessingTypeCodeText,"
        + "ServicePriorityCode,ServicePriorityCodeText,"
        + "ServiceRequestUserLifeCycleStatusCode,ServiceRequestUserLifeCycleStatusCodeText,"
        + "ServiceRequestLifeCycleStatusCode,ServiceRequestLifeCycleStatusCodeText,"
        + "ProcessorPartyName,BuyerPartyID,BuyerPartyName,BuyerMainContactPartyName,RequestFinisheddatetimeContent,"
        + "CreationDateTime,ResolvedOnDateTime,BuyerMainContactPartyID,Z_COMPONENT_SFM_KUT";

    const oCockpitDateTimeFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

    // Chats (mock): autor das mensagens enviadas pelo proprio usuario. E DADO da mensagem
    // (aparece dentro da bolha como o "autor" das notas do DetalheChamado), nao rotulo de UI -
    // por isso nao vem do i18n.
    const AUTOR_MENSAGEM_PROPRIA = "Eu";

    // Chat com SAP: ITSM_types.Comment.type do comentario escrito pelo CLIENTE (nos) para a SAP.
    // Unico discriminador de direcao do endpoint - e por ele que a bolha vai para a direita.
    const TIPO_COMENTARIO_CLIENTE_SAP = "Info for SAP";

    // As duas telas de acompanhamento ("Acompanhar chamados" e "Acompanhar chamados SAP") sao o
    // mesmo par de fragments duplicado, com os mesmos handlers: o sufixo abaixo e o que distingue
    // uma da outra em TODO lugar - id de pagina (acompanharChamados + sufixo), key do menu lateral
    // (a mesma string), ids dos controles dentro dos fragments e chave do estado de filtro/ordem.
    // Sufixo "" = a tela original (C4C).
    const SUFIXOS_ACOMPANHAMENTO = ["", "Sap"];

    return Controller.extend("megawork.mwmonitorchamados.controller.Main", {

        _bExpanded: true,

        // Sufixo da tela de detalhe aberta no momento ("" ou "Sap"). Gravado por
        // _abrirDetalheDoChamado (C4C) e _abrirDetalheCasoSap (Cloud ALM) e lido por _idDetalhe: e o
        // que faz a navegacao abrir a pagina de detalhe do fluxo e onDetalheVoltar voltar para a
        // lista dele, e o que faz os handlers do detalhe C4C (chat, anexos, historico, acoes)
        // mexerem na pagina certa.
        _sSufixoDetalhe: "",

        onInit() {
            this.getView().setModel(new JSONModel({
                passoWizard: PASSO_CLASSIFICACAO,
                podeVoltar: false,
                podeAvancar: false,
                detalheAba: "descricao",
                detalheEdicao: false,
                detalheHeaderExpandido: true,
                // Lista de recentes do cockpit: a List do card binda nesta propriedade, entao ela
                // precisa nascer como array vazio (senao o binding comeca em undefined).
                cockpitRecentes: [],
                // Modulo Chats (mock, sem OData): chatLista alimenta a List da coluna esquerda,
                // chatMensagens a List da conversa e chatSelecionado controla os dois estados da
                // coluna direita (vazio x conversa). Nascem preenchidos/array vazio porque as Lists
                // bindam neles desde o primeiro render.
                chatLista: this._criarChatsMock(),
                chatSelecionado: null,
                chatMensagens: [],
                // Alimenta o busy da List da conversa. Nasce false porque a List binda nele desde
                // o primeiro render (binding em undefined nunca sai do estado ocupado).
                chatCarregando: false,
                // Modulo "Chat com SAP": estado proprio com sufixo Sap porque os handlers sao os
                // mesmos das duas telas - com as mesmas propriedades, selecionar uma conversa numa
                // trocaria a conversa aberta na outra. Ao contrario de /chatLista, esta lista NAO e
                // mock: nasce vazia e e preenchida por _espelharCasosSapNoChat quando a carga dos
                // casos SAP termina.
                chatListaSap: [],
                chatSelecionadoSap: null,
                chatMensagensSap: [],
                chatCarregandoSap: false,
                // Trava de envio da conversa SAP: sem chave de deduplicacao na ALM, dois cliques
                // rapidos gravariam a mesma mensagem duas vezes no caso real. Nasce false porque o
                // FeedInput binda nela desde o primeiro render.
                chatEnviandoSap: false,
                // Preenchido em _carregarRequisitante a partir de _sRequisitanteOrigem: controla
                // a visibilidade da coluna Prioridade (Acompanhar Chamados/SAP) e a aba Criar
                // chamado no menu lateral. Nasce false (mesma logica de podeVoltar/podeAvancar).
                requisitanteEhFuncionario: false,
                // PROVISORIO: e-mail do botao de homologacao ligado (o primeiro nasce pressed)
                emailDev: EMAIL_LOCAL_DEV
            }), "view");

            // Os arrays vem novos: Object.assign copia a REFERENCIA dos arrays do default
            // (ver _resetNovoChamado, mesma pegadinha).
            this.getView().setModel(
                new JSONModel(Object.assign({}, NOVO_CHAMADO_DEFAULTS,
                    { anexos: [], areasAfetadas: [], tiposImpacto: [] })), "novoChamado");

            // Filtros e ordem POR TELA de acompanhamento: cada uma tem lista propria (/Tickets do
            // C4C, /TicketsSap do Cloud ALM) - filtrar/ordenar numa nao pode mexer na outra.
            this._mEstadoAcompanhamento = {};
            SUFIXOS_ACOMPANHAMENTO.forEach((sSufixo) => {
                this._mEstadoAcompanhamento[sSufixo] = {
                    filtros: {
                        search: null,
                        status: null,
                        prioridade: null,
                        data: null
                    },
                    ordemDescendente: false
                };
            });

            if (this.byId("toolPage") && Device.resize.width <= 1024) {
                this.onSideNavButtonPress();
            }

            Device.media.attachHandler(this._handleWindowResize, this);

            this.getOwnerComponent().getModel("tickets").setProperty("/Tickets", []);
            // Lista do fluxo SAP (escopo por S-User): vazia pelo mesmo motivo de /Tickets.
            this._limparCasosSap();

            this._montarListasDeFiltro([]);

            // _carregarTickets filtra por this._sRequisitanteContatoId, que so existe depois de
            // _carregarRequisitante - que trata o proprio erro: um 502 dele derruba o $batch todo.
            // O cockpit tambem filtra por _sRequisitanteContatoId, entao entra na mesma cadeia.
            // Se o requisitante nao foi resolvido (sem contato ou sem empresa no C4C, ou falha de
            // rede), _carregarRequisitante ja mostrou o popup de erro e devolve false: tickets e
            // cockpit nem chegam a ser carregados, o que evita _carregarTickets buscar TUDO sem
            // filtro (o if do filtro so entra com contatoId).
            Promise.all([
                this._carregarRequisitante(),
                this._prepararModelosDetalhe()
            ]).then(([bRequisitanteOk]) => {
                if (!bRequisitanteOk) {
                    return;
                }

                this._carregarTickets();
                this._carregarCockpit();
                // Espera o S-User por dentro: encadear aqui seguraria tickets e cockpit.
                this._carregarChamadosSap();
            });
        },

        onExit() {
            Device.media.detachHandler(this._handleWindowResize, this);
        },

        onSideNavButtonPress() {
            const oToolPage = this.byId("toolPage");
            const bSideExpanded = oToolPage.getSideExpanded();

            this._setToggleButtonTooltip(bSideExpanded);
            oToolPage.setSideExpanded(!bSideExpanded);
        },

        onItemSelect(oEvent) {
            const sKey = oEvent.getParameter("item").getKey();

            this.byId("mainContents").to(this.createId(sKey));

            if (Device.system.phone) {
                this.onSideNavButtonPress();
            }
        },

        onAfterNavigate(oEvent) {
            if (oEvent.getParameter("toId") !== this.createId("criarChamado")) {
                return;
            }

            this._getWizard()?.invalidate();
        },

        onNotificationPress() {
            MessageToast.show(this._getResourceBundle().getText("notificationTitle"));
        },

        // PROVISORIO (homologacao): alterna entre o usuario do shell e EMAIL_LOCAL_DEV. Recarrega
        // requisitante + lista + cockpit porque os tres filtram por _sRequisitanteContatoId - sem
        // isso a tela continuaria mostrando os chamados do requisitante anterior.
        onAlternarEmailLocal() {
            this._selecionarEmailDev(EMAIL_LOCAL_DEV);
        },

        onAlternarEmailEdi() {
            this._selecionarEmailDev(EMAIL_LOCAL_DEV_EDI);
        },

        onAlternarEmailPcoe() {
            this._selecionarEmailDev(EMAIL_LOCAL_DEV_PCOE);
        },

        _selecionarEmailDev(sEmail) {
            this._sEmailDev = sEmail;

            this.getView().getModel("view").setProperty("/emailDev", sEmail);

            const aBotoes = Object.keys(EMAILS_DEV_POR_BOTAO)
                .map((sId) => ({ botao: this.byId(sId), email: EMAILS_DEV_POR_BOTAO[sId] }))
                .filter((oItem) => oItem.botao);

            for (const oItem of aBotoes) {
                oItem.botao.setPressed(oItem.email === sEmail);
                oItem.botao.setEnabled(false);
            }

            // Sair do detalhe: ele esta preso a um indice ("/Tickets/3") que passaria a apontar para
            // outro chamado, e o sufixo pendurado levaria o voltar para a lista do fluxo anterior.
            this._sSufixoDetalhe = "";
            this._irParaHome();

            // Igual ao onInit: se a carga do requisitante novo falhar, ninguem mais substitui o
            // cockpit e as listas, e a Home ficaria com os chamados do anterior.
            this.getOwnerComponent().getModel("tickets").setProperty("/Tickets", []);
            this._montarListasDeFiltro([]);
            this._limparCasosSap();
            this._renderizarCockpit([]);

            // _carregarRequisitante trata o proprio erro (nunca rejeita), entao a cadeia segue e
            // os botoes sempre voltam a ficar clicaveis. Quando ele devolve false ja mostrou o
            // popup de bloqueio - seguir daria a mesma busca sem filtro que a guarda do onInit evita.
            this._carregarRequisitante()
                .then((bRequisitanteOk) => {
                    if (!bRequisitanteOk) {
                        return null;
                    }

                    return Promise.all([
                        this._carregarTickets(),
                        this._carregarCockpit(),
                        // Novo usuario, novo S-User: sem isto a lista SAP fica a do anterior.
                        this._carregarChamadosSap()
                    ]);
                })
                .finally(() => {
                    for (const oItem of aBotoes) {
                        oItem.botao.setEnabled(true);
                    }
                });
        },

        _irParaHome() {
            const oNavContainer = this.byId("mainContents");
            const sIdHome = this.createId("home");

            this.byId("sideNavigation").setSelectedKey("home");

            // NavContainer enfileira o to() emitido durante outra transicao (nao descarta), entao
            // nao ha retentativa a fazer; o if so evita o aviso de "navegar para a pagina atual".
            if (oNavContainer.getCurrentPage()?.getId() !== sIdHome) {
                oNavContainer.to(sIdHome);
            }
        },

        onRefreshCockpit() {
            const oButton = this.byId("cockpitRefreshButton");

            oButton?.setBusyIndicatorDelay(0);
            oButton?.setBusy(true);

            this._carregarCockpit().then((bOk) => {
                if (bOk) {
                    MessageToast.show(this._getResourceBundle().getText("cockpitRefreshSucesso"));
                }
            }).finally(() => {
                oButton?.setBusy(false);
            });
        },

        _setToggleButtonTooltip(bSideExpanded) {
            const sKey = bSideExpanded ? "expandMenuButtonText" : "collapseMenuButtonText";

            this.byId("sideNavigationToggleButton").setTooltip(this._getResourceBundle().getText(sKey));
        },

        _handleWindowResize(oDevice) {
            if ((oDevice.name === "Tablet" && this._bExpanded) || oDevice.name === "Desktop") {
                this.onSideNavButtonPress();
                this._bExpanded = (oDevice.name === "Desktop");
            }
        },

        // Daqui até onRefreshTicketsSap: handlers das DUAS telas de acompanhamento. Cada par
        // on*/on*Sap so escolhe o sufixo e delega para a implementacao comum, que resolve os
        // controles (id + sufixo) e o estado de filtro/ordem daquela tela. O clique na linha e a
        // excecao: os dois detalhes vem de sistemas diferentes e nao compartilham implementacao.
        onSearchTickets(oEvent) {
            this._filtrarChamadosPorTexto(oEvent, "");
        },

        onSearchTicketsSap(oEvent) {
            this._filtrarChamadosPorTexto(oEvent, "Sap");
        },

        _filtrarChamadosPorTexto(oEvent, sSufixo) {
            const sQuery = oEvent.getParameter("query") ?? oEvent.getParameter("newValue") ?? "";
            const oFiltros = this._filtrosDaTela(sSufixo);

            if (sQuery) {
                // A lista SAP so tem correlationId: filtrar por titulo/ID/tipo zeraria a tabela.
                const aCampos = sSufixo === "Sap"
                    ? ["correlationId"]
                    : ["titulo", "ID", "tipo"];

                oFiltros.search = new Filter({
                    filters: aCampos.map((sCampo) => new Filter(sCampo, FilterOperator.Contains, sQuery)),
                    and: false
                });
            } else {
                oFiltros.search = null;
            }

            this._applyTicketFilters(sSufixo);
        },

        onFilterTickets() {
            this._filtrarChamados("");
        },

        onFilterTicketsSap() {
            this._filtrarChamados("Sap");
        },

        _filtrarChamados(sSufixo) {
            const sStatus = this.byId("selectStatus" + sSufixo).getSelectedKey();
            const sPrioridade = this.byId("selectPrioridade" + sSufixo).getSelectedKey();
            const oFiltros = this._filtrosDaTela(sSufixo);

            oFiltros.status = sStatus
                ? new Filter("status", FilterOperator.EQ, sStatus)
                : null;
            oFiltros.prioridade = sPrioridade
                ? new Filter("prioridade", FilterOperator.EQ, sPrioridade)
                : null;

            this._applyTicketFilters(sSufixo);
        },

        onFilterDataAbertura() {
            this._filtrarChamadosPorData("");
        },

        onFilterDataAberturaSap() {
            this._filtrarChamadosPorData("Sap");
        },

        _filtrarChamadosPorData(sSufixo) {
            const oDRS = this.byId("drsDataAbertura" + sSufixo);
            const oFrom = oDRS.getDateValue();
            const oTo = oDRS.getSecondDateValue();
            const oFiltros = this._filtrosDaTela(sSufixo);

            if (oFrom && oTo) {
                oFiltros.data = new Filter(
                    "dataAbertura",
                    FilterOperator.BT,
                    this._toComparableIso(oFrom, false),
                    this._toComparableIso(oTo, true)
                );
            } else {
                oFiltros.data = null;
            }

            this._applyTicketFilters(sSufixo);
        },

        onSortTickets() {
            this._ordenarChamados("");
        },

        onSortTicketsSap() {
            this._ordenarChamados("Sap");
        },

        _ordenarChamados(sSufixo) {
            const oEstado = this._estadoDaTela(sSufixo);

            oEstado.ordemDescendente = !oEstado.ordemDescendente;

            const oBinding = this.byId("ticketsTable" + sSufixo).getBinding("items");
            if (oBinding) {
                oBinding.sort(new Sorter("dataAbertura", oEstado.ordemDescendente));
            }
        },

        onRefreshTickets() {
            this._recarregarChamados("");
        },

        onRefreshTicketsSap() {
            this._recarregarChamados("Sap");
        },

        // Limpa os filtros SO da tela que pediu o refresh; cada tela tem a sua propria lista.
        _recarregarChamados(sSufixo) {
            this.byId("searchTickets" + sSufixo)?.setValue("");
            this.byId("selectStatus" + sSufixo)?.setSelectedKey("");
            this.byId("selectPrioridade" + sSufixo)?.setSelectedKey("");

            const oDRS = this.byId("drsDataAbertura" + sSufixo);
            if (oDRS) {
                oDRS.setDateValue(null);
                oDRS.setSecondDateValue(null);
            }

            const oFiltros = this._filtrosDaTela(sSufixo);
            Object.keys(oFiltros).forEach((sKey) => {
                oFiltros[sKey] = null;
            });
            this._applyTicketFilters(sSufixo);

            // A tela SAP le /TicketsSap, e o true fura o cache do handler - refresh tem de reler.
            const pCarga = sSufixo === "Sap" ? this._carregarChamadosSap(true) : this._carregarTickets();

            pCarga.then((bOk) => {
                if (bOk) {
                    MessageToast.show(this._getResourceBundle().getText("ticketsRefreshTooltip"));
                }
            });
        },

        onTicketPress(oEvent) {
            this._abrirChamadoDaTabela(oEvent, "");
        },

        // A linha SAP NAO passa por _abrirChamadoDaTabela: aquele fluxo binda a linha do modelo
        // "tickets" na pagina de detalhe e dispara chat/historico/anexos do C4C. O caso do Cloud ALM
        // e lido a parte, pelo correlationId da propria linha.
        onTicketPressSap(oEvent) {
            const oContext = oEvent.getSource().getBindingContext("tickets");

            if (!oContext) {
                return;
            }

            const sCorrelationId = String(oContext.getObject()?.correlationId ?? "").trim();

            // Sem correlationId o GET de detalhe sairia sem chave e traria caso de outro requisitante.
            if (!sCorrelationId) {
                MessageToast.show(this._getResourceBundle().getText("detalheSapSemCorrelationId"));
                return;
            }

            this._abrirDetalheCasoSap(sCorrelationId);
        },

        _abrirChamadoDaTabela(oEvent, sSufixo) {
            const oContext = oEvent.getSource().getBindingContext("tickets");

            if (!oContext) {
                return;
            }

            this._abrirDetalheDoChamado(oContext, sSufixo);
        },

        _estadoDaTela(sSufixo) {
            return this._mEstadoAcompanhamento[sSufixo ?? ""];
        },

        _filtrosDaTela(sSufixo) {
            return this._estadoDaTela(sSufixo).filtros;
        },

        // Recebe um Context DO MODELO "tickets" (nao um path solto): _carregarChatDoTicket e
        // _lerMudancasDoC4C leem oContext.getModel()/getPath() e gravam flags na propria linha.
        // sSufixo escolhe o par lista/detalhe do fluxo que abriu o chamado ("" = C4C, "Sap" =
        // Acompanhar chamados SAP) e passa a valer para TODOS os handlers do detalhe, que resolvem
        // seus ids por _idDetalhe enquanto a tela estiver aberta.
        _abrirDetalheDoChamado(oContext, sSufixo) {
            const oViewModel = this.getView().getModel("view");

            if (!oContext) {
                return;
            }

            this._sSufixoDetalhe = sSufixo ?? "";

            this._paginaDetalhe().bindElement({
                path: oContext.getPath(),
                model: "tickets"
            });

            oViewModel.setProperty("/detalheAba", "descricao");
            oViewModel.setProperty("/detalheEdicao", false);
            oViewModel.setProperty("/detalheHeaderExpandido", true);

            this.byId("mainContents").to(this.createId(this._idDetalhe("detalheChamado")));

            // O menu lateral acompanha a tela: o breadcrumb do detalhe (onDetalheVoltar) sempre
            // volta para a lista do fluxo, entao entrar pelo cockpit sem mexer no selectedKey
            // deixaria "Home" marcado sobre a lista de chamados. Vindo da propria tabela, isso ja
            // esta correto e o set e inofensivo.
            this.byId("sideNavigation")?.setSelectedKey(this._idDetalhe("acompanharChamados"));

            // Depois do .to(): a tela abre na hora e chat/historico/anexos chegam quando a rede
            // responder.
            this._carregarChatDoTicket(oContext);
            this._lerMudancasDoC4C(oContext);
            this._carregarAnexosDoTicket(oContext);
        },

        // Detalhe do caso do Cloud ALM. Vive fora do modelo "tickets" (a linha da lista SAP so tem
        // correlationId/caseNumber/subject/customerNumber) e por isso NAO reaproveita nada do
        // detalhe C4C: o fragment SAP le tudo do modelo "casoSap".
        _abrirDetalheCasoSap(sCorrelationId) {
            // Antes de qualquer navegacao: _idDetalhe usa o sufixo para resolver a pagina do detalhe
            // e, depois, a lista para onde onDetalheVoltar volta (acompanharChamadosSap).
            this._sSufixoDetalhe = "Sap";

            const oModelo = this._modeloCasoSap();

            // O correlationId corrente e a chave da guarda de obsolescencia de _lerDetalheCasoSap.
            oModelo.setProperty("/correlationId", sCorrelationId);
            oModelo.setProperty("/caso", null);
            oModelo.setProperty("/falha", false);
            oModelo.setProperty("/carregando", true);

            // Quem limpa a conversa e a abertura: onDetalheVoltar nao mexe no modelo casoSap, e o
            // carregador nao limpa para o refresh do mesmo caso nao piscar vazio sob o busy.
            oModelo.setProperty("/chat", []);
            oModelo.setProperty("/chatFalha", false);
            oModelo.setProperty("/chatCarregando", false);
            // A trava do envio tambem: o modelo casoSap e memoizado (o literal com chatEnviando so
            // roda na PRIMEIRA criacao) e o finally de onDetalheSapEnviarMensagem nao solta a trava
            // de um caso que ja nao e o corrente. Sem este reset, sair do caso com o POST em voo
            // deixaria o campo de mensagem desabilitado em todo caso aberto depois.
            oModelo.setProperty("/chatEnviando", false);

            // Toggle de e-mail dev pode trocar o requisitante enquanto o S-User viaja.
            const iGeracao = this._iGeracaoRequisitante;

            this._lerSUserRequisitante().then((oResultado) => {
                // S-User do usuario anterior abriria o caso com o reporter errado.
                if (iGeracao !== this._iGeracaoRequisitante) {
                    oModelo.setProperty("/carregando", false);

                    return;
                }

                const sSUser = String(oResultado?.sUser ?? "").trim();

                // O GET da ALM exige reporter=<S-User>: sem ele nem vale navegar, a tela abriria
                // vazia e sem chance de carregar.
                if (!sSUser) {
                    Log.warning("Detalhe do chamado SAP ignorado: requisitante sem S-User", null,
                        "megawork.mwmonitorchamados.controller.Main");

                    oModelo.setProperty("/carregando", false);
                    MessageToast.show(this._getResourceBundle().getText("detalheSapSemSUser"));

                    return;
                }

                // O fragment SAP binda nas mesmas propriedades compartilhadas do detalhe.
                const oViewModel = this.getView().getModel("view");

                oViewModel.setProperty("/detalheEdicao", false);
                oViewModel.setProperty("/detalheHeaderExpandido", true);

                this.byId("mainContents").to(this.createId(this._idDetalhe("detalheChamado")));
                this.byId("sideNavigation")?.setSelectedKey(this._idDetalhe("acompanharChamados"));

                // Depois do .to(): a tela abre ja ocupada e os campos chegam com a resposta.
                this._lerDetalheCasoSap(sCorrelationId, sSUser);

                // Chamada propria, e nao dentro da leitura dos campos: sao duas functions OData
                // distintas (1 GET cada) e os campos nao podem esperar 200 comentarios.
                this._carregarComentariosDoDetalheSap(sCorrelationId, sSUser);
            });
        },

        // Criado na primeira abertura (mesmo padrao de _abrirComponentesSap/_abrirAmbientesSap). As
        // flags nascem preenchidas porque o fragment binda nelas desde o primeiro render - busy em
        // undefined nunca sairia do estado ocupado.
        _modeloCasoSap() {
            let oModelo = this.getView().getModel("casoSap");

            if (!oModelo) {
                oModelo = new JSONModel({
                    carregando: false,
                    falha: false,
                    correlationId: "",
                    caso: null,
                    chat: [],
                    chatCarregando: false,
                    chatFalha: false,
                    // Trava de envio: sem chave de deduplicacao na ALM, dois posts em sequencia
                    // gravariam a mesma mensagem duas vezes no caso real.
                    chatEnviando: false
                });
                this.getView().setModel(oModelo, "casoSap");
            }

            return oModelo;
        },

        // Falha nao abre MessageBox: a MessageStrip do proprio detalhe ja avisa e o resto da tela
        // (voltar, refresh) segue util. Devolve se a leitura deu certo - o refresh usa para o toast.
        _lerDetalheCasoSap(sCorrelationId, sSUser) {
            const oModelo = this._modeloCasoSap();
            let oOperation = null;

            return Promise.resolve()
                .then(() => {
                    // $direct: no $batch $auto esta leitura ficaria atras da carga da lista.
                    oOperation = this.getOwnerComponent().getModel()
                        .bindContext("/DetalheCasoSap(...)", null, { $$groupId: "$direct" });
                    oOperation.setParameter("correlationId", sCorrelationId);
                    oOperation.setParameter("sUser", sSUser);

                    return oOperation.invoke();
                })
                .then(() => oOperation.getBoundContext().requestObject())
                .then((oCaso) => {
                    // Resposta lenta de um caso ja abandonado sobrescreveria o caso aberto agora.
                    if (oModelo.getProperty("/correlationId") !== sCorrelationId) {
                        return false;
                    }

                    oModelo.setProperty("/caso", oCaso ?? null);
                    oModelo.setProperty("/falha", false);

                    return true;
                })
                .catch((oError) => {
                    Log.error("Falha ao carregar o detalhe do chamado SAP", oError,
                        "megawork.mwmonitorchamados.controller.Main");

                    // Falha do caso abandonado acusaria erro na tela do caso que carregou bem.
                    if (oModelo.getProperty("/correlationId") !== sCorrelationId) {
                        return false;
                    }

                    MessageToast.show(this._getResourceBundle().getText("detalheSapErroCarregar"));

                    oModelo.setProperty("/caso", null);
                    oModelo.setProperty("/falha", true);

                    return false;
                })
                .finally(() => {
                    // Resposta obsoleta soltaria o busy da leitura do caso novo, ainda em voo.
                    if (oModelo.getProperty("/correlationId") === sCorrelationId) {
                        oModelo.setProperty("/carregando", false);
                    }

                    oOperation?.destroy();
                });
        },

        // Refresh proprio: onDetalheAtualizar rele campos/chat/historico/anexos pelo binding context
        // de "tickets", que o detalhe SAP nao tem. Id do botao fixo, sem _idDetalhe: este handler so
        // existe no fragment SAP.
        onDetalheSapAtualizar() {
            const oButton = this.byId("detalheRefreshButtonSap");
            const oModelo = this._modeloCasoSap();
            const sCorrelationId = String(oModelo.getProperty("/correlationId") ?? "").trim();

            oButton?.setBusyIndicatorDelay(0);
            oButton?.setBusy(true);

            if (!sCorrelationId) {
                oButton?.setBusy(false);

                return;
            }

            // S-User relido: o toggle de e-mail dev pode ter trocado o requisitante com o detalhe aberto.
            this._lerSUserRequisitante()
                .then((oResultado) => {
                    const sSUser = String(oResultado?.sUser ?? "").trim();

                    if (!sSUser) {
                        MessageToast.show(this._getResourceBundle().getText("detalheSapSemSUser"));

                        return false;
                    }

                    // Toast preso ao PRIMEIRO boolean (o dos campos), como no onDetalheAtualizar:
                    // uma falha da conversa mentiria sobre o refresh do chamado.
                    return Promise.all([
                        this._lerDetalheCasoSap(sCorrelationId, sSUser),
                        this._carregarComentariosDoDetalheSap(sCorrelationId, sSUser)
                    ]).then(([bCampos]) => bCampos);
                })
                .then((bOk) => {
                    if (bOk) {
                        MessageToast.show(this._getResourceBundle().getText("detalheSapRefreshSucesso"));
                    }
                })
                .finally(() => {
                    oButton?.setBusy(false);
                });
        },

        // Clique num item da lista de recentes do cockpit. O item vem do modelo "view" (dados crus
        // do C4C, sem ObjectID e fora do modelo do detalhe), entao aqui a linha equivalente e
        // reencontrada em tickets>/Tickets pela ID antes de abrir o detalhe.
        onCockpitTicketPress(oEvent) {
            const oItemContext = oEvent.getSource().getBindingContext("view");

            if (!oItemContext) {
                return;
            }

            const oTicketsModel = this.getOwnerComponent().getModel("tickets");
            const sId = String(oItemContext.getObject()?.id ?? "").trim();
            const sPath = this._pathDoChamadoPorId(oTicketsModel, sId);

            if (sPath) {
                this._abrirDetalheDoChamado(oTicketsModel.getContext(sPath));
                return;
            }

            // Toggle de e-mail pode trocar o requisitante durante o GET.
            const iGeracao = this._iGeracaoRequisitante;

            // O cockpit ordena por LastChangeDateTime e a aba por CreationDateTime (cortando em
            // MAX_TICKETS_LISTA): um chamado antigo com atualizacao recente pode estar na lista de
            // recentes sem estar em /Tickets. Recarregar a lista inteira NAO resolveria (mesma
            // query, mesmo corte) e ainda descartaria os caches de chat/historico das outras
            // linhas, entao busca-se o chamado pelo ID e insere-se so ele na lista.
            this._carregarChamadoPorId(oTicketsModel, sId).then((sPathNovo) => {
                // Evita detalhe do requisitante anterior sobre a tela nova.
                if (iGeracao !== this._iGeracaoRequisitante) {
                    return;
                }

                if (sPathNovo) {
                    this._abrirDetalheDoChamado(oTicketsModel.getContext(sPathNovo));
                    return;
                }

                MessageToast.show(this._getResourceBundle().getText("cockpitChamadoNaoEncontrado"));
            }).catch((oError) => {
                Log.error("Falha ao abrir o chamado a partir do cockpit", oError,
                    "megawork.mwmonitorchamados.controller.Main");
                MessageToast.show(this._getResourceBundle().getText("cockpitChamadoNaoEncontrado"));
            });
        },

        // Busca UM chamado pelo ID e o insere em tickets>/Tickets, devolvendo o path da linha (ou
        // "" se o chamado nao existir mais no C4C). Mesmo $select de _carregarTickets, senao a
        // linha entraria na lista com campos faltando e a tabela/detalhe mostrariam vazios.
        _carregarChamadoPorId(oTicketsModel, sId) {
            if (!sId) {
                return Promise.resolve("");
            }

            const oBinding = this.getOwnerComponent().getModel().bindList("/ServiceRequests", undefined,
                undefined,
                [new Filter("ID", FilterOperator.EQ, sId)],
                { $select: SELECT_CHAMADO_LISTA });

            return oBinding.requestContexts(0, 1).then((aContexts) => {
                const oChamado = aContexts[0]?.getObject();

                if (!oChamado) {
                    return "";
                }

                const aTickets = oTicketsModel.getProperty("/Tickets") ?? [];

                // No topo: a lista e ordenada por CreationDateTime desc no servidor, mas aqui o
                // que importa e o usuario achar a linha que ele acabou de abrir.
                const oLinha = this._normalizarTickets([this._mapearServiceRequest(oChamado)])[0];

                aTickets.unshift(oLinha);
                oTicketsModel.setProperty("/Tickets", aTickets);
                this._montarListasDeFiltro(aTickets);

                // Sem await: o cliente da linha nao aparece na tabela, so no dialogo SAP.
                this._enriquecerClientesSap([oLinha]);

                return this._pathDoChamadoPorId(oTicketsModel, sId);
            }).finally(() => {
                oBinding.destroy();
            });
        },

        // Reconsulta so os campos "core" (mesmo $select de _carregarChamadoPorId) do chamado ja
        // aberto no detalhe e atualiza a linha EXISTENTE - sem descricao, que nao vem deste
        // $select, nem chat/anexos/historico, que sao carregados (e cacheados) por caminhos
        // proprios.
        _atualizarCamposDoChamado(oTicketsModel, sId) {
            if (!sId) {
                return Promise.resolve(false);
            }

            const oBinding = this.getOwnerComponent().getModel().bindList("/ServiceRequests", undefined,
                undefined,
                [new Filter("ID", FilterOperator.EQ, sId)],
                { $select: SELECT_CHAMADO_LISTA });

            return oBinding.requestContexts(0, 1).then((aContexts) => {
                const oChamado = aContexts[0]?.getObject();
                const sPathAtual = this._pathDoChamadoPorId(oTicketsModel, sId);

                if (!oChamado || !sPathAtual) {
                    return false;
                }

                const oCamposAtualizados = this._mapearServiceRequest(oChamado);
                const oLinhaAtual = oTicketsModel.getProperty(sPathAtual);

                // A descricao NAO vem daqui: quem a preenche e _carregarChatDoTicket, a partir da
                // nota 10004. Gravar a string vazia que _mapearServiceRequest devolve apagaria o
                // texto que ja esta na tela.
                delete oCamposAtualizados.descricao;

                // Mesmo motivo da descricao, com o ClienteSap no lugar do chat: as duas nascem
                // vazias no mapeamento e sobrescrever apagaria o cliente ja resolvido.
                const bTrocouDeCliente = String(oLinhaAtual?.buyerPartyId ?? "")
                    !== String(oCamposAtualizados.buyerPartyId ?? "");

                delete oCamposAtualizados.customerNbr;
                delete oCamposAtualizados.customerNome;

                // buyerMainContactPartyId NAO entra nos delete: vem do $select, entao sobrescrever e
                // o certo — contato principal reatribuido no C4C tem de chegar na linha.
                Object.keys(oCamposAtualizados).forEach((sCampo) => {
                    oTicketsModel.setProperty(sPathAtual + "/" + sCampo, oCamposAtualizados[sCampo]);
                });

                // Cliente reatribuido no C4C: manter o numero antigo mandaria o chamado para o
                // customer errado na ALM, entao limpa e reconsulta.
                if (bTrocouDeCliente) {
                    oTicketsModel.setProperty(sPathAtual + "/customerNbr", "");
                    oTicketsModel.setProperty(sPathAtual + "/customerNome", "");
                    this._enriquecerClientesSap([oTicketsModel.getProperty(sPathAtual)]);
                }

                return true;
            }).catch((oError) => {
                Log.error("Falha ao atualizar os campos do chamado " + sId, oError,
                    "megawork.mwmonitorchamados.controller.Main");

                return false;
            }).finally(() => {
                oBinding.destroy();
            });
        },

        _carregarTickets() {
            const oComponent = this.getOwnerComponent();
            const oModel = oComponent.getModel();
            const oTicketsModel = oComponent.getModel("tickets");
            // So a do C4C: a tabela SAP vem de /TicketsSap via _carregarChamadosSap.
            const aTabelas = [this.byId("ticketsTable")].filter(Boolean);

            aTabelas.forEach((oTable) => {
                oTable.setBusyIndicatorDelay(0);
                oTable.setBusy(true);
            });

            // Sem contatoId o binding sairia SEM filtro nenhum, trazendo os chamados de todo o
            // tenant (vazamento entre clientes). _carregarRequisitante ja bloqueia esse caso, mas a
            // guarda fica aqui tambem porque este metodo tem varios pontos de chamada (onInit,
            // toggle de e-mail, refresh apos criar chamado) - o cockpit ja se protege do mesmo jeito.
            if (!this._sRequisitanteContatoId) {
                Log.warning("Carga de chamados ignorada: requisitante sem contatoId, o filtro de "
                    + "escopo do chamado nao pode ser montado", null,
                    "megawork.mwmonitorchamados.controller.Main");

                this._montarListasDeFiltro([]);
                oTicketsModel.setProperty("/Tickets", []);
                aTabelas.forEach((oTable) => oTable.setBusy(false));

                return Promise.resolve(false);
            }

            const aFiltros = [
                new Filter(this._getCampoEscopoChamado(), FilterOperator.EQ, this._sRequisitanteContatoId)
            ];

            const oBinding = oModel.bindList("/ServiceRequests", undefined,
                [new Sorter("CreationDateTime", true)],
                aFiltros,
                { $select: SELECT_CHAMADO_LISTA });

            return oBinding.requestContexts(0, MAX_TICKETS_LISTA).then((aContexts) => {
                const aLinhas = aContexts.map((oContext) => this._mapearServiceRequest(oContext.getObject()));

                this._normalizarTickets(aLinhas);

                this._montarListasDeFiltro(aLinhas);
                oTicketsModel.setProperty("/Tickets", aLinhas);

                // Sem await: o numero do cliente nao tem coluna na tabela, entao segurar a carga
                // por ele atrasaria a lista inteira por um dado que so o dialogo SAP le.
                this._enriquecerClientesSap(aLinhas);

                return true;
            }).catch((oError) => {
                Log.error("Falha ao carregar os chamados do backend", oError,
                    "megawork.mwmonitorchamados.controller.Main");

                MessageToast.show(this._getResourceBundle().getText("ticketsErroCarregar"));

                return false;
            }).finally(() => {
                aTabelas.forEach((oTable) => oTable.setBusy(false));
                oBinding.destroy();
            });
        },

        // Escopo por S-User, logo roda DEPOIS dele (tickets/cockpit usam contatoId e nao esperam).
        _carregarChamadosSap(bAtualizar) {
            const oTable = this.byId("ticketsTableSap");

            // Fora do executor nao existe S-User: limpar, senao fica a lista do usuario anterior.
            if (this._sRequisitanteOrigem !== ORIGEM_REQUISITANTE_FUNCIONARIO) {
                this._limparCasosSap();

                return Promise.resolve(false);
            }

            // Toggle de e-mail dev pode trocar o usuario enquanto esta carga viaja.
            const iGeracao = this._iGeracaoRequisitante;

            this._iCargasChamadosSapEmVoo = (this._iCargasChamadosSapEmVoo ?? 0) + 1;

            oTable?.setBusyIndicatorDelay(0);
            oTable?.setBusy(true);

            return this._lerSUserRequisitante()
                .then((oResultado) => {
                    if (iGeracao !== this._iGeracaoRequisitante) {
                        return false;
                    }

                    const sSUser = String(oResultado?.sUser ?? "").trim();

                    // Sem S-User a busca sai sem escopo e vaza chamado de outro usuario.
                    if (!sSUser) {
                        Log.warning("Carga de chamados SAP ignorada: requisitante sem S-User", null,
                            "megawork.mwmonitorchamados.controller.Main");

                        this._limparCasosSap();

                        return false;
                    }

                    return this._lerCasosSapDosChamados(sSUser, iGeracao, bAtualizar);
                })
                .finally(() => {
                    this._iCargasChamadosSapEmVoo -= 1;

                    // Solta o busy so quando nenhuma carga esta em voo: a obsoleta chega antes.
                    if (!this._iCargasChamadosSapEmVoo) {
                        oTable?.setBusy(false);
                    }
                });
        },

        // Junto com a lista: flag de truncado que sobra de uma carga anterior mentiria sobre a nova.
        _limparCasosSap() {
            const oTicketsModel = this.getOwnerComponent().getModel("tickets");

            oTicketsModel.setProperty("/TicketsSap", []);
            oTicketsModel.setProperty("/CasosSapTotal", 0);
            oTicketsModel.setProperty("/CasosSapExibidos", 0);
            oTicketsModel.setProperty("/CasosSapTruncado", false);
            oTicketsModel.setProperty("/CasosSapFalha", false);

            // A lista do chat e espelho de /TicketsSap: sem isso o usuario sem escopo (ou o toggle
            // de e-mail) continuaria com os casos do usuario anterior na coluna da esquerda.
            this._espelharCasosSapNoChat();
        },

        // Falha nao abre MessageBox: a lista do C4C e o resto da tela seguem uteis.
        _lerCasosSapDosChamados(sSUser, iGeracao, bAtualizar) {
            let oOperation = null;

            return Promise.resolve()
                .then(() => {
                    // $direct: no $batch $auto esta leitura cara (chamados + clientes + casos)
                    // seguraria a lista do C4C.
                    oOperation = this.getOwnerComponent().getModel()
                        .bindContext("/CasosSapDosChamados(...)", null, { $$groupId: "$direct" });
                    oOperation.setParameter("contatoId", this._sRequisitanteContatoId);
                    oOperation.setParameter("executor", true);
                    oOperation.setParameter("sUser", sSUser);
                    // So o refresh pede releitura: sem isso a tela repaga a varredura a cada entrada.
                    oOperation.setParameter("atualizar", bAtualizar === true);

                    return oOperation.invoke();
                })
                .then(() => oOperation.getBoundContext().requestObject())
                .then((oResultado) => {
                    // Resposta lenta do usuario anterior mostraria os casos dele na tabela do novo.
                    if (iGeracao !== this._iGeracaoRequisitante) {
                        return false;
                    }

                    const oTicketsModel = this.getOwnerComponent().getModel("tickets");

                    oTicketsModel.setProperty("/TicketsSap", (oResultado?.casos ?? [])
                        .filter(Boolean)
                        .map((oCaso) => ({
                            correlationId: String(oCaso.correlationId ?? ""),
                            caseNumber: String(oCaso.caseNumber ?? ""),
                            subject: String(oCaso.subject ?? ""),
                            customerNumber: String(oCaso.customerNumber ?? "")
                        })));

                    // Truncado/falha na tela: lista parcial calada afirmaria que nao ha mais caso.
                    oTicketsModel.setProperty("/CasosSapTotal", Number(oResultado?.total ?? 0));
                    oTicketsModel.setProperty("/CasosSapExibidos", Number(oResultado?.exibidos ?? 0));
                    oTicketsModel.setProperty("/CasosSapTruncado", oResultado?.truncado === true);
                    oTicketsModel.setProperty("/CasosSapFalha", oResultado?.falha === true);

                    this._espelharCasosSapNoChat();

                    return true;
                })
                .catch((oError) => {
                    Log.error("Falha ao carregar os chamados do SAP Cloud ALM", oError,
                        "megawork.mwmonitorchamados.controller.Main");

                    if (iGeracao === this._iGeracaoRequisitante) {
                        this._limparCasosSap();
                        MessageToast.show(this._getResourceBundle().getText("ticketsSapErroCarregar"));
                    }

                    return false;
                })
                .finally(() => {
                    oOperation?.destroy();
                });
        },

        // Espelho, nao binding: a List do chat escreve naoLidas/mensagens POR LINHA e a tabela SAP
        // filtra o mesmo array por correlationId - bindar direto em tickets>/TicketsSap faria uma
        // tela sujar e filtrar a outra. Roda no fim da carga (e do _limparCasosSap) em vez de num
        // gancho de navegacao: CasosSapDosChamados repaga ate 60 GETs de detalhe sem cache na ALM.
        _espelharCasosSapNoChat() {
            const aCasos = this.getOwnerComponent().getModel("tickets")
                .getProperty("/TicketsSap") ?? [];
            const oModel = this.getView().getModel("view");

            oModel.setProperty("/chatListaSap", aCasos.map((oCaso) => ({
                // id e correlationId valem o mesmo de proposito: id e o contrato de
                // _pathDoChatPorId/_enviarMensagemDoChat e correlationId e o parametro da ALM.
                // caseNumber NAO serve de id - o backend nao inventa numero e ele pode vir "".
                id: oCaso.correlationId,
                correlationId: oCaso.correlationId,
                customerNumber: oCaso.customerNumber,
                nome: oCaso.caseNumber,
                // subject vai para os DOIS campos de texto do fragmento (departamento e o subtitulo
                // do cabecalho da conversa; ultimaMensagem e a segunda linha do item). De quebra
                // _buscarChats filtra nome/departamento/ultimaMensagem, entao a busca cobre numero
                // do caso e assunto sem tocar no filtro.
                departamento: oCaso.subject,
                ultimaMensagem: oCaso.subject,
                // O caso nao tem data nem contador de nao lidas: "" faz formatter.dataAbertura
                // devolver "" e 0 apaga o ObjectStatus pelo visible do markup - e por isso que o
                // item da lista continua identico ao da tela Chats.
                dataHora: "",
                naoLidas: 0,
                // Cache por linha dos comentarios lidos, no mesmo desenho de chat/chatCarregado do
                // DetalheChamado: reabrir o caso nao repaga o GET na ALM, e a mensagem digitada no
                // FeedInput continua morando aqui.
                mensagens: [],
                comentariosCarregados: false
            })));

            // A conversa aberta apontava para um item do array ANTIGO: sem soltar a selecao o
            // cabecalho continuaria mostrando um caso que nao esta mais na lista.
            oModel.setProperty("/chatSelecionadoSap", null);
            oModel.setProperty("/chatMensagensSap", []);

            // A lista trocou de objetos, entao a leitura em voo tem de morrer aqui: ela reresolve o
            // path por id e gravaria mensagens/comentariosCarregados na linha NOVA, repintando uma
            // conversa que nao esta mais selecionada. Como o finally dela passa a ser ignorado, o
            // busy precisa ser solto junto.
            this._iGeracaoComentariosCasoSap = (this._iGeracaoComentariosCasoSap || 0) + 1;
            oModel.setProperty("/chatCarregandoSap", false);
        },

        // O tenant rotula o SRRQ como "Service Request" e no idioma do usuario do C4C; o negocio
        // chama isso de Incidente. So o CODE e estavel para decidir o rotulo, nunca o *CodeText.
        _tipoTexto(sCode, sTextoDoTenant) {
            if (String(sCode ?? "").trim().toUpperCase() === PROCESSING_TYPE_CODE_C4C) {
                return this._getResourceBundle().getText("tipoChamadoSRRQ");
            }

            return sTextoDoTenant ?? "";
        },

        _mapearServiceRequest(oServiceRequest) {
            return {
                ID: String(oServiceRequest.ID ?? ""),
                objectID: oServiceRequest.ObjectID ?? "",
                // Componente ja gravado no header do C4C: o dialogo SAP abre com ele para o
                // requisitante so trocar quando precisar.
                componenteSapId: String(oServiceRequest.Z_COMPONENT_SFM_KUT ?? "").trim(),
                titulo: String(oServiceRequest.Name ?? ""),
                tipo: this._tipoTexto(oServiceRequest.ProcessingTypeCode, oServiceRequest.ProcessingTypeCodeText),
                prioridade: oServiceRequest.ServicePriorityCode ?? "",
                prioridadeTexto: oServiceRequest.ServicePriorityCodeText ?? "",
                status: oServiceRequest.ServiceRequestUserLifeCycleStatusCode ?? "",
                statusTexto: oServiceRequest.ServiceRequestUserLifeCycleStatusCodeText ?? "",
                situacao: oServiceRequest.ServiceRequestLifeCycleStatusCode ?? "",
                situacaoTexto: oServiceRequest.ServiceRequestLifeCycleStatusCodeText ?? "",
                responsavelId: oServiceRequest.ProcessorPartyName ?? "",
                cliente: oServiceRequest.BuyerPartyName ?? "",
                // Entrada do ClienteSap no dialogo SAP: o nome nao e chave, so o ID acha o C4C.
                buyerPartyId: oServiceRequest.BuyerPartyID ?? "",
                // Preenchidos por _enriquecerClientesSap, que vem da BusinessPartnerCollection e
                // nao deste $select: nascem vazios para a linha ja ter a forma final.
                customerNbr: "",
                customerNome: "",
                // Chave do requisitante ao lado do nome: o nome tem homonimo no C4C e so o ID
                // resolve o S-User certo.
                buyerMainContactPartyId: oServiceRequest.BuyerMainContactPartyID ?? "",
                buyerMainContactPartyName: oServiceRequest.BuyerMainContactPartyName ?? "",
                requestFinisheddatetimeContent: oServiceRequest.RequestFinisheddatetimeContent ?? "",
                dataAbertura: this._paraIsoLocal(oServiceRequest.CreationDateTime),
                resolvidoEm: this._paraIsoLocal(oServiceRequest.ResolvedOnDateTime),
                descricao: ""
            };
        },

        // Numero do cliente na propria linha, em UMA chamada para os BuyerPartyID distintos: sem
        // isso cada abertura do dialogo SAP repetiria o GET cru no C4C.
        _enriquecerClientesSap(aLinhas) {
            const aIds = [...new Set((aLinhas ?? [])
                .filter((oLinha) => !oLinha?.customerNbr)
                .map((oLinha) => String(oLinha?.buyerPartyId ?? "").trim())
                .filter(Boolean))];

            if (!aIds.length) {
                return Promise.resolve();
            }

            let oOperation = null;

            return Promise.resolve()
                .then(() => {
                    // $direct: no $batch default este GET lento seguraria a carga da tabela.
                    oOperation = this.getOwnerComponent().getModel().bindContext("/ClientesSap(...)",
                        null, { $$groupId: "$direct" });
                    oOperation.setParameter("businessPartnerIds", aIds.join(","));

                    return oOperation.invoke();
                })
                .then(() => oOperation.getBoundContext().requestObject())
                .then((oResultado) => {
                    // Por id, nao por posicao: o C4C nao devolve o lote na ordem do $filter e
                    // parceiro sem cadastro simplesmente nao volta.
                    const mPorId = new Map((oResultado?.clientes ?? [])
                        .filter(Boolean)
                        .map((oCliente) => [String(oCliente.businessPartnerId ?? "").trim(), oCliente]));

                    aLinhas.forEach((oLinha) => {
                        const oCliente = mPorId.get(String(oLinha?.buyerPartyId ?? "").trim());

                        if (!oCliente) {
                            return;
                        }

                        oLinha.customerNbr = String(oCliente.customerNumber ?? "").trim();
                        oLinha.customerNome = String(oCliente.nome ?? "").trim();
                    });
                })
                .catch((oError) => {
                    // warning e nao error: a linha sem numero cai no fallback do proprio dialogo.
                    Log.warning("Falha ao resolver o cliente dos chamados da lista", oError,
                        "megawork.mwmonitorchamados.controller.Main");
                })
                .finally(() => {
                    oOperation?.destroy();
                });
        },

        _montarListasDeFiltro(aLinhas) {
            const oTicketsModel = this.getOwnerComponent().getModel("tickets");
            const oBundle = this._getResourceBundle();

            const fnDistintos = (sCampoCode, sCampoTexto) => {
                const mPorCode = new Map();

                aLinhas.forEach((oLinha) => {
                    const sCode = oLinha[sCampoCode];

                    if (sCode && !mPorCode.has(sCode)) {
                        mPorCode.set(sCode, { code: sCode, descricao: oLinha[sCampoTexto] || sCode });
                    }
                });

                return Array.from(mPorCode.values())
                    .sort((oA, oB) => oA.descricao.localeCompare(oB.descricao, "pt-BR"));
            };

            const aStatus = fnDistintos("status", "statusTexto");
            const aPrioridades = fnDistintos("prioridade", "prioridadeTexto");

            oTicketsModel.setProperty("/FiltroStatus",
                [{ code: "", descricao: oBundle.getText("ticketsFiltroTodos") }].concat(aStatus));
            oTicketsModel.setProperty("/FiltroPrioridade",
                [{ code: "", descricao: oBundle.getText("ticketsFiltroTodas") }].concat(aPrioridades));

            oTicketsModel.setProperty("/StatusEditavel", aStatus);
        },

        _paraIsoLocal(vData) {
            if (!vData) {
                return "";
            }

            const aMatch = /\/Date\((-?\d+)/.exec(String(vData));
            const oDate = aMatch ? new Date(Number(aMatch[1])) : new Date(vData);

            if (isNaN(oDate.getTime())) {
                return "";
            }

            const fnPad = (iValue) => String(iValue).padStart(2, "0");

            return oDate.getFullYear() + "-" + fnPad(oDate.getMonth() + 1) + "-" + fnPad(oDate.getDate())
                + "T" + fnPad(oDate.getHours()) + ":" + fnPad(oDate.getMinutes()) + ":" + fnPad(oDate.getSeconds());
        },

        onDetalheVoltar() {
            this.getView().getModel("view")?.setProperty("/detalheEdicao", false);
            this.byId("mainContents").to(this.createId(this._idDetalhe("acompanharChamados")));
        },

        // Id do controle/pagina do detalhe ABERTO no momento: os dois fragments do detalhe usam os
        // mesmos handlers e os ids do segundo sao os do primeiro + "Sap".
        _idDetalhe(sId) {
            return sId + this._sSufixoDetalhe;
        },

        _paginaDetalhe() {
            return this.byId(this._idDetalhe("detalheChamado"));
        },

        // Botao de refresh do header do detalhe: releitura de TUDO que o detalhe cacheia por linha
        // (campos core, chat, historico e anexos), em paralelo, com busy no proprio botao.
        onDetalheAtualizar() {
            const oButton = this.byId(this._idDetalhe("detalheRefreshButton"));
            const oContext = this._paginaDetalhe().getBindingContext("tickets");

            if (!oContext) {
                return;
            }

            oButton?.setBusyIndicatorDelay(0);
            oButton?.setBusy(true);

            const oTicketsModel = oContext.getModel();
            const sPathTicket = oContext.getPath();
            const sId = String(oTicketsModel.getProperty(sPathTicket + "/ID") ?? "").trim();

            // chatCarregado e a guarda que faz _carregarChatDoTicket pular a releitura: zera-la
            // antes de chamar de novo, senao o refresh nao busca nada.
            oTicketsModel.setProperty(sPathTicket + "/chatCarregado", false);

            Promise.all([
                this._atualizarCamposDoChamado(oTicketsModel, sId),
                this._carregarChatDoTicket(oContext),
                this._lerMudancasDoC4C(oContext),
                // Os anexos tem cache proprio por linha: _recarregarAnexosDoDetalhe zera
                // anexosCarregado E marca anexosRelerPendente, senao a guarda de leitura em voo
                // faria o refresh sair calado e a aba Anexos ficaria com dados velhos.
                this._recarregarAnexosDoDetalhe(sId)
            ]).then(([bOk]) => {
                if (bOk) {
                    MessageToast.show(this._getResourceBundle().getText("detalheRefreshSucesso"));
                }
            }).finally(() => {
                oButton?.setBusy(false);
            });
        },

        onDetalheToggleEdicao(oEvent) {
            const oViewModel = this.getView().getModel("view");
            const bPressed = oEvent.getSource().getPressed();

            if (!bPressed && !oViewModel.getProperty("/detalheHeaderExpandido")) {
                oEvent.getSource().setPressed(true);
                oViewModel.setProperty("/detalheEdicao", true);
                oViewModel.setProperty("/detalheHeaderExpandido", true);
                return;
            }

            if (bPressed) {
                oViewModel.setProperty("/detalheHeaderExpandido", true);
            }

            oViewModel.setProperty("/detalheEdicao", bPressed);
        },

        onDetalheStatusChange(oEvent) {
            const oItem = oEvent.getParameter("selectedItem");
            const sStatus = oItem?.getKey() ?? oEvent.getSource().getSelectedKey();
            const oContext = oEvent.getSource().getBindingContext("tickets");

            if (!oContext || !sStatus) {
                return;
            }

            const oModel = oContext.getModel();
            const sPath = oContext.getPath();
            const sDescricao = oItem?.getText() ?? sStatus;

            oModel.setProperty(sPath + "/status", sStatus);
            oModel.setProperty(sPath + "/statusTexto", sDescricao);

            this._registrarHistoricoDetalhe(oContext, "Status alterado para " + sDescricao);
            MessageToast.show(sDescricao);
        },

        onDetalheEnviarMensagem(oEvent) {
            const sTexto = (oEvent.getParameter("value") || "").trim();
            const oContext = oEvent.getSource().getBindingContext("tickets");

            if (!sTexto || !oContext) {
                return;
            }

            // Chamado encerrado nao recebe mensagem (rede de seguranca: o fragmento ja desabilita o
            // FeedInput). O toast e necessario porque o FeedInput limpa o value ao postar.
            if (formatter.chamadoEncerrado(oContext.getProperty("status"))) {
                Log.info("Envio de mensagem bloqueado: chamado encerrado",
                    String(oContext.getProperty("status") ?? ""),
                    "megawork.mwmonitorchamados.controller.Main");
                MessageToast.show(this._getResourceBundle().getText("detalheChatBloqueadoEncerrado"));
                return;
            }

            const oModel = oContext.getModel();
            const sPath = oContext.getPath();
            const sPathChat = sPath + "/chat";
            const sId = String(oModel.getProperty(sPath + "/ID") ?? "").trim();
            const sObjectID = String(oModel.getProperty(sPath + "/objectID") ?? "").trim();
            const aChat = oModel.getProperty(sPathChat) ?? [];

            aChat.push({
                autor: this._sRequisitanteNome || this._getResourceBundle().getText("criarChamadoRequisitante"),
                texto: sTexto,
                quando: this._agoraIso(),
                eu: true
            });
            oModel.setProperty(sPathChat, aChat);

            this._enviarMensagemAoC4C(sId, sObjectID, sTexto)
                .then((oResposta) => this._substituirMensagemLocalPorC4C(sId, sTexto, oResposta))
                .catch((oError) => {
                    Log.error("Falha ao enviar mensagem ao C4C", oError,
                        "megawork.mwmonitorchamados.controller.Main");

                    if (this._ehChamadoNoDetalhe(sId)) {
                        MessageToast.show(this._getResourceBundle().getText("detalheChatErroEnviar"));
                    }
                });
        },

        _enviarMensagemAoC4C(sId, sObjectID, sTexto) {
            if (!sObjectID?.trim()) {
                return Promise.reject(new Error("Mensagem: ObjectID do chamado não disponível"));
            }

            const oModel = this.getOwnerComponent().getModel();
            const oListBinding = oModel.bindList("/ServiceRequestTexts");
            const oContext = oListBinding.create({
                ParentObjectID: sObjectID,
                TypeCode: TYPE_CODE_RESPOSTA_REQUISITANTE_C4C,
                Text: sTexto,
                AuthorID: this._sRequisitanteContatoId
            }, true);

            return oContext.created()
                .then(() => oContext.getObject())
                .finally(() => oListBinding.destroy());
        },

        _substituirMensagemLocalPorC4C(sId, sTextoOriginal, oResposta) {
            const oTicketsModel = this.getOwnerComponent().getModel("tickets");
            const sPath = this._pathDoChamadoPorId(oTicketsModel, sId);

            if (!sPath) {
                return;
            }

            const aChat = oTicketsModel.getProperty(sPath + "/chat") ?? [];
            const iIndice = aChat.findIndex((oMsg) =>
                !oMsg.origemC4C && oMsg.eu === true && oMsg.texto === sTextoOriginal
            );

            if (iIndice >= 0) {
                const sAutor = String(oResposta.AuthorName ?? "").trim()
                    || String(oResposta.CreatedBy ?? "").trim()
                    || this._getResourceBundle().getText("detalheChatAutorDesconhecido");

                aChat[iIndice] = {
                    autor: sAutor,
                    texto: String(oResposta.Text ?? "").trim(),
                    quando: this._paraIsoLocal(oResposta.CreatedOn)
                        || this._paraIsoLocal(oResposta.TextCreatedOn)
                        || this._paraIsoLocal(oResposta.UpdatedOn)
                        || aChat[iIndice].quando,
                    eu: true,
                    origemC4C: true
                };
                oTicketsModel.setProperty(sPath + "/chat", aChat);
            }
        },

        // Le as notas do chamado (ServiceRequestTextCollection do C4C) e alimenta tickets>chat.
        _carregarChatDoTicket(oContext) {
            const oTicketsModel = oContext.getModel();
            const sPathTicket = oContext.getPath();
            const sId = String(oTicketsModel.getProperty(sPathTicket + "/ID") ?? "").trim();

            // A flag mora na LINHA: um refresh da lista recria as linhas e o chat e relido.
            if (oTicketsModel.getProperty(sPathTicket + "/chatCarregado")) {
                return Promise.resolve(true);
            }

            // Guarda de leitura em voo por linha (evita GET duplicado no duplo clique) e tambem
            // o estado de busy que a List do chat le.
            if (oTicketsModel.getProperty(sPathTicket + "/chatCarregando")) {
                return Promise.resolve(false);
            }

            oTicketsModel.setProperty(sPathTicket + "/chatCarregando", true);

            return this._resolverObjectIDdoTicket(oTicketsModel, sPathTicket, sId)
                .then((sObjectID) => {
                    // Sem ObjectID o path /ServiceRequests('')/... estoura no C4C.
                    if (!sObjectID) {
                        return Promise.reject(new Error("Chamado " + sId + " sem ObjectID"));
                    }

                    // _lerInteracoesDoChamado nunca rejeita: Promise.all so falha pela leitura de notas.
                    return Promise.all([
                        this._lerNotasDoChamado(sObjectID),
                        this._lerInteracoesDoChamado(sObjectID)
                    ]);
                })
                .then(([aNotas, aInteracoes]) => {
                    const oDescricaoNota = aNotas.find((oNota) =>
                        String(oNota.TypeCode ?? "").trim() === TYPE_CODE_DESCRICAO_C4C);
                    const sDescricao = String(oDescricaoNota?.Text ?? "").trim();

                    const aChatNotas = aNotas
                        // So conversa: nota interna nao pode virar bolha na tela do requisitante.
                        // Exclui a descricao inicial (10004): ela vai pro campo descricao, nao pro chat.
                        .filter((oNota) => {
                            const sTypeCode = String(oNota.TypeCode ?? "").trim();
                            return TYPE_CODES_CHAT_C4C.includes(sTypeCode)
                                && sTypeCode !== TYPE_CODE_DESCRICAO_C4C;
                        })
                        .map((oNota) => this._mapearNotaParaChat(oNota))
                        .filter((oMensagem) => oMensagem.texto);

                    const aChatInteracoes = aInteracoes
                        .map((oInteracao) => this._mapearInteracaoParaChat(oInteracao))
                        .filter((oMensagem) => oMensagem.texto);

                    const aChat = this._mesclarChatSemDuplicar(aChatNotas, aChatInteracoes)
                        // A List do chat nao tem sorter: a ordem exibida e a do array.
                        .sort((oA, oB) => oA.quando.localeCompare(oB.quando));

                    const sPathAtual = this._pathDoChamadoPorId(oTicketsModel, sId);

                    if (!sPathAtual) {
                        return false;
                    }

                    if (sDescricao) {
                        oTicketsModel.setProperty(sPathAtual + "/descricao", sDescricao);
                    }

                    // Mescla, nao substitui: mensagem digitada durante a leitura (sem origemC4C)
                    // seria apagada por um setProperty seco.
                    const aLocais = (oTicketsModel.getProperty(sPathAtual + "/chat") ?? [])
                        .filter((oMensagem) => !oMensagem.origemC4C);

                    oTicketsModel.setProperty(sPathAtual + "/chat", aChat.concat(aLocais));
                    oTicketsModel.setProperty(sPathAtual + "/chatCarregado", true);

                    return true;
                })
                .catch((oError) => {
                    Log.error("Falha ao carregar as mensagens do chamado " + sId, oError,
                        "megawork.mwmonitorchamados.controller.Main");

                    // O toast so sai se o chamado que falhou for o que esta na tela.
                    if (this._ehChamadoNoDetalhe(sId)) {
                        MessageToast.show(this._getResourceBundle().getText("detalheChatErroCarregar"));
                    }

                    return false;
                })
                .finally(() => {
                    const sPathAtual = this._pathDoChamadoPorId(oTicketsModel, sId);

                    if (sPathAtual) {
                        oTicketsModel.setProperty(sPathAtual + "/chatCarregando", false);
                    }
                });
        },

        // O path do contexto e um indice ("/Tickets/3") e a lista se mexe por baixo (unshift de
        // chamado novo, refresh): reencontrar pela ID evita gravar na linha de outro chamado.
        _pathDoChamadoPorId(oTicketsModel, sId) {
            if (!sId) {
                return "";
            }

            const iIndice = (oTicketsModel.getProperty("/Tickets") ?? [])
                .findIndex((oTicket) => String(oTicket.ID ?? "").trim() === sId);

            return iIndice < 0 ? "" : "/Tickets/" + iIndice;
        },

        _ehChamadoNoDetalhe(sId) {
            const oContext = this._paginaDetalhe()?.getBindingContext("tickets");

            return Boolean(sId) && String(oContext?.getProperty("ID") ?? "").trim() === sId;
        },

        // Um chamado recem-criado pode ter entrado na lista sem objectID (a resposta do create nao
        // o trouxe): nesse caso resolve pelo ID do chamado e grava na linha.
        _resolverObjectIDdoTicket(oTicketsModel, sPathTicket, sId) {
            const sObjectID = String(oTicketsModel.getProperty(sPathTicket + "/objectID") ?? "").trim();

            if (sObjectID) {
                return Promise.resolve(sObjectID);
            }

            if (!sId) {
                return Promise.resolve("");
            }

            const oBinding = this.getOwnerComponent().getModel().bindList("/ServiceRequests", undefined,
                undefined,
                [new Filter("ID", FilterOperator.EQ, sId)],
                { $select: "ID,ObjectID,Name" });

            return oBinding.requestContexts(0, 1).then((aContexts) => {
                const sResolvido = String(aContexts[0]?.getObject()?.ObjectID ?? "").trim();
                const sPathAtual = this._pathDoChamadoPorId(oTicketsModel, sId);

                if (sResolvido && sPathAtual) {
                    oTicketsModel.setProperty(sPathAtual + "/objectID", sResolvido);
                }

                return sResolvido;
            }).finally(() => {
                oBinding.destroy();
            });
        },

        _lerNotasDoChamado(sObjectID) {
            // Path de navegacao como o C4C documenta; apostrofo DUPLICADO porque a chave vai entre
            // apostrofos no literal OData (encodeURIComponent nao escapa apostrofo).
            const sPath = "/ServiceRequests('" + String(sObjectID).replace(/'/g, "''")
                + "')/ServiceRequestTextCollection";
            const oBinding = this.getOwnerComponent().getModel().bindList(sPath, undefined,
                // Descendente para MAX_NOTAS_CHAT cortar as notas ANTIGAS; a exibicao volta a
                // ascendente no cliente, depois do corte.
                [new Sorter("CreatedOn", true)],
                undefined, {
                // As tres datas vem juntas porque o C4C so preenche CreatedOn sozinho.
                // FormattedAuthorName fica fora: vem vazio em todas as notas deste tenant.
                $select: "TypeCode,AuthorName,CreatedBy,Text,CreatedOn,TextCreatedOn,UpdatedOn"
            });

            return oBinding.requestContexts(0, MAX_NOTAS_CHAT)
                .then((aContexts) => aContexts.map((oNotaContext) => oNotaContext.getObject()))
                .catch((oError) => {
                    Log.error("Falha ao carregar as notas do chamado " + sObjectID, oError,
                        "megawork.mwmonitorchamados.controller.Main");

                    return Promise.reject(oError);
                })
                .finally(() => {
                    oBinding.destroy();
                });
        },

        // origemC4C marca a mensagem como vinda do backend: e por essa marca que a releitura do
        // chat sabe o que pode substituir e o que e local do FeedInput.
        _mapearNotaParaChat(oNota) {
            // No tenant a maioria das notas volta com AuthorName vazio e o nome so vem em CreatedBy.
            const sAutor = String(oNota.AuthorName ?? "").trim()
                || String(oNota.CreatedBy ?? "").trim()
                || this._getResourceBundle().getText("detalheChatAutorDesconhecido");

            return {
                autor: sAutor,
                texto: String(oNota.Text ?? "").trim(),
                quando: this._paraIsoLocal(oNota.CreatedOn)
                    || this._paraIsoLocal(oNota.TextCreatedOn)
                    || this._paraIsoLocal(oNota.UpdatedOn),
                eu: this._ehMensagemDoRequisitante(String(oNota.TypeCode ?? "").trim(), sAutor),
                origemC4C: true
            };
        },

        _mapearInteracaoParaChat(oInteracao) {
            const sAutor = String(oInteracao.autor ?? "").trim()
                || this._getResourceBundle().getText("detalheChatAutorDesconhecido");

            return {
                autor: sAutor,
                texto: String(oInteracao.texto ?? "").trim(),
                quando: this._paraIsoLocal(oInteracao.quando),
                eu: this._ehMensagemDoRequisitante("", sAutor),
                origemC4C: true
            };
        },

        _chaveDedupe(sAutor, sTexto, sQuando) {
            const fnNorm = (s) => String(s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
            return fnNorm(sAutor) + "|" + fnNorm(sTexto) + "|" + String(sQuando ?? "").slice(0, 16);
        },

        _mesclarChatSemDuplicar(aChatNotas, aChatInteracoes) {
            const oChavesNotas = new Set(
                aChatNotas.map((m) => this._chaveDedupe(m.autor, m.texto, m.quando)));
            const aInteracoesUnicas = aChatInteracoes.filter((m) =>
                !oChavesNotas.has(this._chaveDedupe(m.autor, m.texto, m.quando)));
            return aChatNotas.concat(aInteracoesUnicas);
        },

        onAbrirComponentesSap() {
            this._abrirComponentesSap("novoChamado");
        },

        // Busca unica para wizard e dialogo SAP; sModeloDestino diz onde a escolha e gravada.
        _abrirComponentesSap(sModeloDestino) {
            this._sModeloComponenteSap = sModeloDestino;

            if (!this.getView().getModel("componentesSap")) {
                this.getView().setModel(new JSONModel({
                    carregando: false,
                    busca: "",
                    total: 0,
                    exibidos: 0,
                    componentes: []
                }), "componentesSap");
            }

            this.byId("dialogComponentesSap").open();
            this._carregarComponentesSap();
        },

        onFecharComponentesSap() {
            this.byId("dialogComponentesSap").close();
        },

        // Grava {id, chave, descricao} em <destino>/componenteSap - o id (ex.: "BC-CCM") e o que
        // vai no Z_COMPONENT_SFM_KUT do C4C; produto e obsoleto so servem a tabela de busca.
        onSelecionarComponenteSap(oEvent) {
            const oComponente = oEvent.getSource().getBindingContext("componentesSap").getObject();
            const sModelo = this._sModeloComponenteSap || "novoChamado";

            this.getView().getModel(sModelo).setProperty("/componenteSap", {
                id: oComponente.id,
                chave: oComponente.chave,
                descricao: oComponente.descricao
            });

            this.byId("dialogComponentesSap").close();
        },

        onLimparComponenteSap() {
            this.getView().getModel("novoChamado").setProperty("/componenteSap", null);
        },

        onBuscarComponentesSap(oEvent) {
            this.getView().getModel("componentesSap")
                .setProperty("/busca", oEvent.getParameter("query") || "");
            this._carregarComponentesSap();
        },

        _carregarComponentesSap() {
            const oModelo = this.getView().getModel("componentesSap");
            oModelo.setProperty("/carregando", true);

            const oOperation = this.getOwnerComponent().getModel().bindContext("/ComponentesSap(...)");
            oOperation.setParameter("busca", oModelo.getProperty("/busca") || "");

            return oOperation.invoke()
                .then(() => oOperation.getBoundContext().requestObject())
                .then((oResultado) => {
                    oModelo.setProperty("/componentes", oResultado?.componentes ?? []);
                    oModelo.setProperty("/total", oResultado?.total ?? 0);
                    oModelo.setProperty("/exibidos", oResultado?.exibidos ?? 0);
                })
                .catch((oError) => {
                    Log.error("Falha ao carregar os componentes do SAP Cloud ALM", oError,
                        "megawork.mwmonitorchamados.controller.Main");
                    oModelo.setProperty("/componentes", []);
                    oModelo.setProperty("/total", 0);
                    oModelo.setProperty("/exibidos", 0);
                    MessageBox.error(this._getResourceBundle().getText("criarChamadoComponentesSapErro"));
                })
                .finally(() => {
                    oModelo.setProperty("/carregando", false);
                    oOperation.destroy();
                });
        },

        // Espera a consulta do cliente: /AmbientesSap e por customerNumber, e clicar antes dela
        // responder mandaria numero vazio ao backend e traria a MessageBox de erro sem motivo.
        async onAbrirAmbientesSap() {
            await this._pClienteChamadoSap;

            if (!this._modeloChamadoSap().getProperty("/customerNbr")) {
                MessageToast.show(this._getResourceBundle().getText("abrirChamadoSapAmbientesSemCliente"));
                return;
            }

            this._abrirAmbientesSap();
        },

        _abrirAmbientesSap() {
            if (!this.getView().getModel("ambientesSap")) {
                this.getView().setModel(new JSONModel({
                    carregando: false,
                    busca: "",
                    total: 0,
                    exibidos: 0,
                    ambientes: []
                }), "ambientesSap");
            }

            this.byId("dialogAmbientesSap").open();
            this._carregarAmbientesSap();
        },

        onFecharAmbientesSap() {
            this.byId("dialogAmbientesSap").close();
        },

        // Grava tambem installationNbr/systemNbr: nao aparecem na lista, mas sao o que o chamado usa.
        onSelecionarAmbienteSap(oEvent) {
            const oAmbiente = oEvent.getSource().getBindingContext("ambientesSap").getObject();

            this._modeloChamadoSap().setProperty("/ambiente", {
                installationNbr: oAmbiente.installationNbr,
                systemNbr: oAmbiente.systemNbr,
                systemName: oAmbiente.systemName,
                systemType: oAmbiente.systemType,
                systemId: oAmbiente.systemId
            });

            this.byId("dialogAmbientesSap").close();
        },

        onLimparAmbienteSap() {
            this._modeloChamadoSap().setProperty("/ambiente", null);
        },

        // Filtro no cliente: a API de landscape nao tem parametro de busca, nao ha nova chamada.
        onBuscarAmbientesSap(oEvent) {
            this.getView().getModel("ambientesSap")
                .setProperty("/busca", oEvent.getParameter("query") || "");
            this._filtrarAmbientesSap();
        },

        _carregarAmbientesSap() {
            const oModelo = this.getView().getModel("ambientesSap");
            const sCustomerNbr = this._modeloChamadoSap().getProperty("/customerNbr") || "";

            // Numero vazio NAO e recusado pelo backend: ele cai no customer da Megawork e
            // listaria ambientes de outro cliente sem nenhum aviso na tela.
            if (!sCustomerNbr) {
                oModelo.setProperty("/carregando", false);
                this._aAmbientesSap = [];
                this._filtrarAmbientesSap();

                return Promise.resolve();
            }

            oModelo.setProperty("/carregando", true);

            const oOperation = this.getOwnerComponent().getModel().bindContext("/AmbientesSap(...)");
            oOperation.setParameter("customerNumber", sCustomerNbr);

            return oOperation.invoke()
                .then(() => oOperation.getBoundContext().requestObject())
                .then((oResultado) => {
                    this._aAmbientesSap = oResultado?.ambientes ?? [];
                    this._filtrarAmbientesSap();
                })
                .catch((oError) => {
                    Log.error("Falha ao carregar os ambientes do SAP Cloud ALM", oError,
                        "megawork.mwmonitorchamados.controller.Main");
                    this._aAmbientesSap = [];
                    oModelo.setProperty("/ambientes", []);
                    oModelo.setProperty("/total", 0);
                    oModelo.setProperty("/exibidos", 0);
                    MessageBox.error(this._getResourceBundle().getText("abrirChamadoSapAmbientesErro"));
                })
                .finally(() => {
                    oModelo.setProperty("/carregando", false);
                    oOperation.destroy();
                });
        },

        _filtrarAmbientesSap() {
            const oModelo = this.getView().getModel("ambientesSap");
            const aTodos = this._aAmbientesSap || [];
            const sBusca = (oModelo.getProperty("/busca") || "").trim().toLowerCase();

            const aFiltrados = sBusca
                ? aTodos.filter((oAmbiente) => [oAmbiente.systemName, oAmbiente.systemType, oAmbiente.systemId]
                    .some((sCampo) => (sCampo || "").toLowerCase().includes(sBusca)))
                : aTodos;

            oModelo.setProperty("/ambientes", aFiltrados);
            oModelo.setProperty("/total", aTodos.length);
            oModelo.setProperty("/exibidos", aFiltrados.length);
        },

        _lerInteracoesDoChamado(sObjectID) {
            const oOperation = this.getOwnerComponent().getModel().bindContext("/InteracoesDoChamado(...)");
            oOperation.setParameter("objectID", sObjectID);

            return oOperation.invoke()
                .then(() => oOperation.getBoundContext().requestObject())
                .then((oResultado) => oResultado?.interacoes ?? [])
                .catch((oError) => {
                    Log.error("Falha ao carregar as interacoes do chamado " + sObjectID, oError,
                        "megawork.mwmonitorchamados.controller.Main");
                    return [];
                })
                .finally(() => oOperation.destroy());
        },

        // Lado da bolha: 10008 = Reply from Customer (requisitante), 10007 = Reply to Customer.
        _ehMensagemDoRequisitante(sTypeCode, sAutor) {
            if (sTypeCode === TYPE_CODE_RESPOSTA_REQUISITANTE_C4C) {
                return true;
            }

            if (sTypeCode === TYPE_CODE_RESPOSTA_ATENDIMENTO_C4C) {
                return false;
            }

            // A descricao (10004) nao diz de que lado nasceu: sobra a heuristica pelo nome, ja que
            // a function Requisitante nao devolve e-mail nem AuthorUUID.
            const sRequisitante = String(this._sRequisitanteNome ?? "").trim();

            return Boolean(sRequisitante) && sAutor.toLowerCase() === sRequisitante.toLowerCase();
        },

        // Le as mudancas do chamado (ChangeDocumentCollection do C4C) e alimenta tickets>historico.
        _lerMudancasDoC4C(oContext) {
            if (!oContext) {
                return Promise.resolve(false);
            }

            const oTicketsModel = oContext.getModel();
            const sPathTicket = oContext.getPath();
            const sId = String(oTicketsModel.getProperty(sPathTicket + "/ID") ?? "").trim();

            // Guarda de leitura em voo por linha (evita GET duplicado no duplo clique) e tambem
            // o estado de busy que a Timeline do historico le.
            if (oTicketsModel.getProperty(sPathTicket + "/historicoCarregando")) {
                return Promise.resolve(false);
            }

            oTicketsModel.setProperty(sPathTicket + "/historicoCarregando", true);

            return this._resolverObjectIDdoTicket(oTicketsModel, sPathTicket, sId)
                .then((sObjectID) => {
                    // Sem ObjectID o $filter volta 200 com value:[]; tratar como falha de leitura.
                    if (!sObjectID) {
                        return Promise.reject(new Error("Chamado " + sId + " sem ObjectID"));
                    }

                    // UMA leitura, e so: o /ChangeDocuments ja traz todo o conteudo tecnico
                    // necessario (inclusive o TimePointRoleCode dos nos de data), entao a triagem
                    // acontece em JavaScript. As leituras de enriquecimento que existiam aqui
                    // (textos e documentos de referencia) sairam - uma delas nunca respondia.
                    return this._lerMudancasDoC4CRaw(sObjectID);
                })
                .then((aMudancas) => {
                    // Passo de tratamento: array bruto -> apenas as alteracoes relevantes.
                    const aAlteracoes = this._normalizarMudancasComoAlteracoesC4C(aMudancas);

                    // Conversao para o formato que a Timeline binda (autor/quando/texto/sistema).
                    const aMudancosMapeadas = aAlteracoes
                        .map((oAlteracao) => this._mapearAlteracaoParaHistorico(oAlteracao));

                    const sPathAtual = this._pathDoChamadoPorId(oTicketsModel, sId);

                    if (!sPathAtual) {
                        return false;
                    }

                    const aHistoricoExistente = oTicketsModel.getProperty(sPathAtual + "/historico") ?? [];

                    // As linhas do C4C sao SUBSTITUIDAS, nao acumuladas: _abrirDetalheDoChamado
                    // dispara esta leitura a CADA abertura e nao ha flag historicoCarregado (o chat
                    // tem chatCarregado, os anexos tem anexosCarregado). Concatenar o slice(1) cru
                    // repetia todo o historico do C4C a cada reabertura - 70 linhas viravam 140, 210.
                    // Os comentarios locais nao tem origemC4C e por isso sobrevivem ao filtro: eles
                    // so existem no modelo e nao voltariam numa releitura.
                    const aLocais = aHistoricoExistente.slice(1)
                        .filter((oLinha) => oLinha?.origemC4C !== true);

                    // "Abertura" primeiro, depois as mudancas do C4C, e os comentarios locais no fim.
                    const aHistoricoMesclado = [
                        aHistoricoExistente[0] || {
                            autor: this._getResourceBundle().getText("detalheHistoricoSistema"),
                            quando: oTicketsModel.getProperty(sPathAtual + "/dataAbertura"),
                            texto: this._getResourceBundle().getText("detalheHistoricoAbertura"),
                            sistema: true
                        },
                        ...aMudancosMapeadas,
                        ...aLocais
                    ];

                    oTicketsModel.setProperty(sPathAtual + "/historico", aHistoricoMesclado);

                    return true;
                })
                .catch((oError) => {
                    Log.error("Falha ao carregar o histórico do chamado " + sId, oError,
                        "megawork.mwmonitorchamados.controller.Main");

                    return false;
                })
                .finally(() => {
                    const sPathAtual = this._pathDoChamadoPorId(oTicketsModel, sId);

                    if (sPathAtual) {
                        oTicketsModel.setProperty(sPathAtual + "/historicoCarregando", false);
                    }
                });
        },

        // Apesar do nome, ObjectUUID espera o ObjectID (32 hex SEM hifen): a forma com hifen devolve
        // 200 com value:[]. BusinessObject e case-sensitive ('SERVICEREQUEST' devolve 502).
        _lerMudancasDoC4CRaw(sObjectUUID) {
            const oModel = this.getOwnerComponent().getModel();

            const aFilters = [
                new Filter("BusinessObject", FilterOperator.EQ, "ServiceRequest"),
                new Filter("ObjectUUID", FilterOperator.EQ, sObjectUUID.replace(/-/g, ""))
            ];

            const oBinding = oModel.bindList("/ChangeDocuments", undefined,
                [new Sorter("ChangeDateTime", true)],
                aFilters, {
                    // ObjectNodeElementModificationTypeCode entrou junto: a triagem roda toda em JS
                    // e precisa do registro tecnico completo numa leitura unica. Nao ha $filter por
                    // ObjectNodeElementName de proposito - a propriedade e sap:filterable="false".
                    $select: "ID,BusinessObject,ObjectUUID,ChangeDateTime,ChangedByUserName," +
                        "ObjectNodeElementName,ObjectNodeElementOldContent,ObjectNodeElementNewContent," +
                        "ObjectNodeElementModificationTypeCode,CompleteNodeHierarchy"
                });

            return oBinding.requestContexts(0, MAX_MUDANCAS_HISTORICO)
                .then((aContexts) => {
                    const aMudancas = aContexts.map((oContext) => oContext.getObject());
                    return aMudancas;
                })
                // Sem .catch de proposito: a falha tem de chegar ao .catch de _lerMudancasDoC4C, senao
                // qualquer erro viraria "chamado sem historico".
                .finally(() => {
                    oBinding.destroy();
                });
        },

        // Triagem do payload bruto do /ChangeDocuments, em DUAS passagens sobre o mesmo array.
        //
        // 1a passagem: monta o Map TimePointTerms(UUID) -> TimePointRoleCode. O nome do campo de
        //   data e sempre "TimePoint/DateTime/content", identico para todas as datas; quem
        //   diferencia "Resposta pelo cliente em" de "Resposta pelo agente em" e o
        //   TimePointRoleCode/content que chega em OUTRO registro, do MESMO no TimePointTerms.
        //   Por isso o mapa tem de estar pronto antes de classificar qualquer data - e por isso
        //   sao duas passagens e nao uma.
        // 2a passagem: aplica a whitelist e produz o objeto intermediario de cada alteracao.
        //
        // Devolve os registros na ordem em que o C4C mandou (ChangeDateTime desc); a Timeline
        // reordena sozinha por sortOldestFirst="false".
        _normalizarMudancasComoAlteracoesC4C(aMudancas) {
            const aRegistros = aMudancas ?? [];
            const mTimePointRoles = new Map();

            aRegistros.forEach((oMudanca) => {
                if (String(oMudanca?.ObjectNodeElementName ?? "").trim() !== CAMPO_TIMEPOINT_ROLE) {
                    return;
                }

                const sUUID = this._extrairUuidTimePointTerms(oMudanca.CompleteNodeHierarchy);
                const sRole = String(oMudanca.ObjectNodeElementNewContent ?? "").trim();

                if (sUUID && sRole) {
                    mTimePointRoles.set(sUUID, sRole);
                }
            });

            return aRegistros
                .map((oMudanca) => {
                    const sAtributo = this._resolverAtributoAlteracaoC4C(oMudanca, mTimePointRoles);

                    // null = fora da whitelist (ou role de data nao exibido): nao vira linha.
                    if (!sAtributo) {
                        return null;
                    }

                    const sCampo = String(oMudanca.ObjectNodeElementName ?? "").trim();

                    return {
                        id: oMudanca.ID,
                        autor: String(oMudanca.ChangedByUserName ?? "").trim(),
                        quando: this._paraIsoLocal(oMudanca.ChangeDateTime),
                        atributo: sAtributo,
                        valorAnterior: this._formatarValorAlteracaoC4C(sCampo,
                            oMudanca.ObjectNodeElementOldContent),
                        valorNovo: this._formatarValorAlteracaoC4C(sCampo,
                            oMudanca.ObjectNodeElementNewContent),
                        tipoModificacao: oMudanca.ObjectNodeElementModificationTypeCode || "",
                        sistema: false,
                        origemC4C: true
                    };
                })
                .filter((oAlteracao) => oAlteracao !== null);
        },

        // Extrai o UUID do no TimePointTerms de dentro do CompleteNodeHierarchy.
        // "Root(...)-TimePointTerms(ABC123)" -> "ABC123". O ultimo TimePointTerms da string e o
        // relevante (a hierarquia vem da raiz para a folha).
        _extrairUuidTimePointTerms(sHierarquia) {
            const sTexto = String(sHierarquia ?? "").trim();

            if (!sTexto) {
                return "";
            }

            const oRegex = /TimePointTerms\((['"]?)([^)'"]+)\1\)/gi;
            let sUUID = "";
            let aMatch = oRegex.exec(sTexto);

            while (aMatch) {
                sUUID = aMatch[2].trim().toUpperCase();
                aMatch = oRegex.exec(sTexto);
            }

            return sUUID;
        },

        // Decide se a mudanca entra na Timeline e com que rotulo. null = nao exibir.
        _resolverAtributoAlteracaoC4C(oMudanca, mTimePointRoles) {
            if (!oMudanca) {
                return null;
            }

            const sCampo = String(oMudanca.ObjectNodeElementName ?? "").trim();

            // Data: o rotulo depende do role do no TimePointTerms irmao (843/842 exibem, 841 e
            // qualquer outro nao). Sem UUID ou sem role no mapa, tambem nao exibe.
            if (sCampo === CAMPO_TIMEPOINT_DATA) {
                const sUUID = this._extrairUuidTimePointTerms(oMudanca.CompleteNodeHierarchy);
                const sRole = sUUID ? mTimePointRoles.get(sUUID) : "";

                return MAPA_TIMEPOINT_ROLE_CODE[sRole] || null;
            }

            // Status/ServiceRequestLifeCycleStatusCode: ignorar se vem de ServiceRequestHistoricalVersion
            // (duplicata sem valor anterior; a correta vem de Root(...) direto). O evento correto tera
            // valor anterior e novo, a copia tera newContent apenas.
            if (sCampo === "Status/ServiceRequestLifeCycleStatusCode" &&
                String(oMudanca.CompleteNodeHierarchy || "").includes("ServiceRequestHistoricalVersion(")) {
                return null;
            }

            // Todo o resto: so a whitelist passa.
            return MAPA_ATRIBUTOS_ALTERACOES_C4C[sCampo] || null;
        },

        // Traduz o conteudo tecnico (antigo ou novo) para o que a tela deve mostrar.
        // Aplicacoes especificas por campo: datas, mapeadores de codigo, etc.
        _formatarValorAlteracaoC4C(sCampo, vValor) {
            const sValor = String(vValor ?? "").trim();

            if (!sValor) {
                return "";
            }

            // ISO/UTC ("2026-08-07T17:55:28Z") -> data/hora LOCAL em pt-BR.
            if (sCampo === CAMPO_TIMEPOINT_DATA) {
                return this._formatarDataHoraCockpit(sValor) || sValor;
            }

            // "2574" -> "2574-Atividade de nota"; codigo desconhecido sai cru.
            if (sCampo === "BusinessTransactionDocumentReference/TypeCode") {
                const sDescricao = MAPA_TIPO_DOCUMENTO_REFERENCIA_C4C[sValor];

                return sDescricao ? sValor + "-" + sDescricao : sValor;
            }

            // "1" -> "1-Aberto", "4" -> "4-Fechado"; codigo desconhecido sai cru.
            if (sCampo === "Status/ServiceRequestLifeCycleStatusCode") {
                const sDescricao = MAPA_STATUS_INTERNO[sValor];

                return sDescricao ? sValor + "-" + sDescricao : sValor;
            }

            // "1" -> "1-Novo", "6" -> "6-Fechado"; codigo desconhecido sai cru.
            // DIFERENTE do mapa de Status interno: dois campos distintos, duas semânticas.
            if (sCampo === "ServiceRequestUserLifeCycleStatusCode") {
                const sDescricao = MAPA_STATUS_CHAMADO[sValor];

                return sDescricao ? sValor + "-" + sDescricao : sValor;
            }

            // HorasMegawork, Tst, AlternativeName, Name, etc: valores crus (sem mapeamento).
            return sValor;
        },

        // Objeto intermediario -> item da Timeline. As chaves lidas pelo TimelineItem sao
        // autor/quando/texto/sistema; origemC4C fica so no JS, para o merge de _lerMudancasDoC4C.
        // O \n vira <br> no TimelineItem; em outro controle de texto colapsaria.
        _mapearAlteracaoParaHistorico(oAlteracao) {
            const aLinhas = ["Atributo: " + oAlteracao.atributo];

            // "Alterado de" sai fora quando nao havia valor anterior (inclusao): a aba "Alteracoes"
            // tambem deixa a coluna vazia nesse caso, e "Alterado de: (vazio)" so poluiria.
            if (oAlteracao.valorAnterior) {
                aLinhas.push("Alterado de: " + oAlteracao.valorAnterior);
            }

            aLinhas.push("Alterado para: " + (oAlteracao.valorNovo || "removido"));

            return {
                autor: oAlteracao.autor
                    || this._getResourceBundle().getText("detalheChatAutorDesconhecido"),
                quando: oAlteracao.quando,
                texto: aLinhas.join("\n"),
                sistema: false,
                origemC4C: true
            };
        },

        // Le os anexos do chamado (ServiceRequestAttachmentFolder do C4C) e alimenta tickets>anexos.
        _carregarAnexosDoTicket(oContext) {
            if (!oContext) {
                return Promise.resolve(false);
            }

            const oTicketsModel = oContext.getModel();
            const sPathTicket = oContext.getPath();
            const sId = String(oTicketsModel.getProperty(sPathTicket + "/ID") ?? "").trim();

            // A flag mora na LINHA: um refresh da lista recria as linhas e os anexos sao relidos.
            if (oTicketsModel.getProperty(sPathTicket + "/anexosCarregado")) {
                return Promise.resolve(true);
            }

            // Guarda de leitura em voo por linha (evita GET duplicado no duplo clique) e tambem
            // o estado de busy que a List de anexos le. Quem PRECISA da releitura marca
            // anexosRelerPendente antes de chamar (ver _recarregarAnexosDoDetalhe): sair aqui sem
            // reler deixaria valendo o resultado de uma leitura que saiu antes do POST.
            if (oTicketsModel.getProperty(sPathTicket + "/anexosCarregando")) {
                return Promise.resolve(false);
            }

            oTicketsModel.setProperty(sPathTicket + "/anexosCarregando", true);
            // A pendencia e consumida ao INICIAR a leitura: se ela sobrevivesse ate o finally desta
            // mesma leitura, todo pedido de releitura sem concorrencia geraria um segundo GET.
            oTicketsModel.setProperty(sPathTicket + "/anexosRelerPendente", false);

            return this._resolverObjectIDdoTicket(oTicketsModel, sPathTicket, sId)
                .then((sObjectID) => {
                    // Sem ObjectID o path /ServiceRequests('')/... estoura no C4C.
                    if (!sObjectID) {
                        return Promise.reject(new Error("Chamado " + sId + " sem ObjectID"));
                    }

                    return this._lerAnexosDoChamado(sObjectID);
                })
                .then((aAnexos) => {
                    const aDoC4C = aAnexos.map((oAnexo) => this._mapearAnexoDoC4C(oAnexo));
                    const sPathAtual = this._pathDoChamadoPorId(oTicketsModel, sId);

                    if (!sPathAtual) {
                        return false;
                    }

                    // SUBSTITUI, ao contrario do chat: um anexo local ja existe (ou vai existir) no
                    // C4C e voltaria duplicado se fosse preservado. So o upload em voo ainda nao
                    // esta la, e quem o apaga da lista e o proprio onDetalheAnexoAdicionar.
                    const aEmVoo = (oTicketsModel.getProperty(sPathAtual + "/anexos") ?? [])
                        .filter((oAnexo) => oAnexo.enviando === true);

                    // Sem reordenar no cliente: o $orderby desc do GET ja e a ordem de exibicao.
                    oTicketsModel.setProperty(sPathAtual + "/anexos", aDoC4C.concat(aEmVoo));
                    oTicketsModel.setProperty(sPathAtual + "/anexosCarregado", true);

                    return true;
                })
                .catch((oError) => {
                    Log.error("Falha ao carregar os anexos do chamado " + sId, oError,
                        "megawork.mwmonitorchamados.controller.Main");

                    // O toast so sai se o chamado que falhou for o que esta na tela; a lista fica
                    // vazia, mas o IllustratedMessage de "nenhum anexo" nao mente sobre o motivo
                    // porque o erro foi anunciado.
                    if (this._ehChamadoNoDetalhe(sId)) {
                        MessageToast.show(this._getResourceBundle().getText("detalheAnexosErroCarregar"));
                    }

                    return false;
                })
                .finally(() => {
                    const sPathAtual = this._pathDoChamadoPorId(oTicketsModel, sId);

                    if (!sPathAtual) {
                        return;
                    }

                    oTicketsModel.setProperty(sPathAtual + "/anexosCarregando", false);

                    // Pediram releitura enquanto ESTA leitura estava em voo (um upload terminou no
                    // meio dela): o que acabou de ser gravado e a lista de ANTES do POST, e o
                    // anexosCarregado = true acima faria o arquivo novo ficar invisivel pelo resto
                    // da sessao. Reentra em vez de descartar o pedido.
                    if (oTicketsModel.getProperty(sPathAtual + "/anexosRelerPendente")) {
                        oTicketsModel.setProperty(sPathAtual + "/anexosCarregado", false);
                        this._carregarAnexosDoTicket(oTicketsModel.getContext(sPathAtual));
                    }
                });
        },

        _lerAnexosDoChamado(sObjectID) {
            // Navegacao no SINGULAR (ServiceRequestAttachmentFolder): o sufixo Collection, que o
            // chat usa para as notas, nao existe como navegacao desta entidade no $metadata V4.
            // Apostrofo DUPLICADO porque a chave vai entre apostrofos no literal OData.
            const sPath = "/ServiceRequests('" + String(sObjectID).replace(/'/g, "''")
                + "')/ServiceRequestAttachmentFolder";
            const oBinding = this.getOwnerComponent().getModel().bindList(sPath, undefined,
                // Descendente: mais novo primeiro, que e a ordem de exibicao (a aba nao pagina e
                // MAX_ANEXOS_CHAMADO corta os ANTIGOS).
                [new Sorter("CreatedOn", true)],
                undefined, {
                // Binary fica FORA: e LargeBinary, o adapter do CAP o apagaria do $select antes do
                // handler (gerando "failed to drill-down" com autoExpandSelect) e um arquivo por
                // linha inflaria a listagem. Os bytes saem so pela function AnexoConteudo, no
                // clique. Esta entidade nao tem campo de tamanho nem AuthorName.
                $select: "ObjectID,Name,MimeType,CreatedOn,CreatedBy"
            });

            return oBinding.requestContexts(0, MAX_ANEXOS_CHAMADO)
                .then((aContexts) => aContexts.map((oAnexoContext) => oAnexoContext.getObject()))
                .catch((oError) => {
                    Log.error("Falha ao carregar os anexos do chamado " + sObjectID, oError,
                        "megawork.mwmonitorchamados.controller.Main");

                    return Promise.reject(oError);
                })
                .finally(() => {
                    oBinding.destroy();
                });
        },

        _mapearAnexoDoC4C(oAnexo) {
            return {
                objectID: String(oAnexo.ObjectID ?? "").trim(),
                nome: String(oAnexo.Name ?? "").trim(),
                mimeType: String(oAnexo.MimeType ?? "").trim(),
                // O contrato do C4C nao tem campo de tamanho nesta entidade: so o arquivo escolhido
                // nesta sessao conhece os bytes, entao depois de um F5 a legenda vem sem tamanho.
                tamanho: "",
                // So CreatedBy: esta entidade nao tem AuthorName (as notas do chat tem), e o tenant
                // nem sempre o preenche.
                autor: String(oAnexo.CreatedBy ?? "").trim(),
                quando: this._paraIsoLocal(oAnexo.CreatedOn),
                baixando: false,
                enviando: false,
                origemC4C: true
            };
        },

        // Baixa o anexo clicado. Os bytes vem da function AnexoConteudo, nunca da listagem: o
        // adapter V4 apaga toda coluna LargeBinary do $select antes do handler.
        onDetalheAnexoPress(oEvent) {
            const oContext = oEvent.getSource().getBindingContext("tickets");

            if (!oContext) {
                return;
            }

            const oTicketsModel = oContext.getModel();
            const sPathAnexo = oContext.getPath();
            const sObjectID = String(oContext.getProperty("objectID") ?? "").trim();
            const sNome = String(oContext.getProperty("nome") ?? "").trim();
            const sMimeType = String(oContext.getProperty("mimeType") ?? "").trim();

            // Linha otimista de upload em voo: ainda nao tem chave no C4C para baixar.
            if (!sObjectID) {
                MessageToast.show(this._getResourceBundle().getText("detalheAnexoSemConteudo"));
                return;
            }

            // Trava por linha: sem ela o duplo clique baixaria os ~13,4 MB duas vezes.
            if (oContext.getProperty("baixando") === true) {
                return;
            }

            oTicketsModel.setProperty(sPathAnexo + "/baixando", true);

            // $direct: no grupo default os ~13,4 MB de base64 entrariam no $batch das leituras,
            // dentro de uma resposta multipart.
            const oOperation = this.getOwnerComponent().getModel().bindContext("/AnexoConteudo(...)",
                null, { $$groupId: "$direct" });

            oOperation.setParameter("objectID", sObjectID);

            oOperation.invoke()
                .then(() => oOperation.getBoundContext().requestObject())
                .then((oConteudo) => {
                    // O base64 NAO vai para o modelo: ficaria vivo na sessao inteira e viajaria em
                    // cada clone da linha.
                    this._baixarArquivoBase64(
                        oConteudo?.base64 ?? "",
                        oConteudo?.nome || sNome,
                        oConteudo?.mimeType || sMimeType || MIME_TYPE_PADRAO_ANEXO
                    );
                })
                .catch((oError) => {
                    Log.error("Falha ao baixar o anexo " + sObjectID, oError,
                        "megawork.mwmonitorchamados.controller.Main");
                    MessageToast.show(this._getResourceBundle().getText("detalheAnexoErroBaixar"));
                })
                .finally(() => {
                    // O path do item tambem e um indice ("/Tickets/3/anexos/2") e a lista pode ter
                    // sido relida no meio: sem conferir a chave, o flag cairia em outro anexo.
                    if (oTicketsModel.getProperty(sPathAnexo + "/objectID") === sObjectID) {
                        oTicketsModel.setProperty(sPathAnexo + "/baixando", false);
                    }

                    oOperation.destroy();
                });
        },

        _baixarArquivoBase64(sBase64, sNome, sMimeType) {
            if (!sBase64) {
                throw new Error("Anexo " + sNome + " sem conteudo binario");
            }

            const sBinario = window.atob(sBase64);
            const aBytes = new Uint8Array(sBinario.length);

            // Char a char: um TextEncoder reinterpretaria os bytes como UTF-8 e corromperia
            // qualquer arquivo que nao seja texto ASCII.
            for (let i = 0; i < sBinario.length; i++) {
                aBytes[i] = sBinario.charCodeAt(i);
            }

            const sUrl = window.URL.createObjectURL(new Blob([aBytes], { type: sMimeType }));
            const oLink = window.document.createElement("a");

            oLink.href = sUrl;
            oLink.download = sNome || "anexo";
            window.document.body.appendChild(oLink);
            oLink.click();
            oLink.remove();

            // Revoke no PROXIMO tick: revogar na mesma volta cancela o download no Safari/iOS, e
            // sem revoke os 10 MB do object URL vazam pela sessao.
            window.setTimeout(() => window.URL.revokeObjectURL(sUrl), 0);
        },

        // Anexa arquivos a um chamado que JA existe. Um POST por arquivo (ver _criarAnexoNoC4C) e
        // releitura no fim, que e o que da objectID - logo, download - as linhas que subiram.
        onDetalheAnexoAdicionar(oEvent) {
            const oUploader = oEvent.getSource();
            const oContext = this._paginaDetalhe().getBindingContext("tickets");

            if (!oContext) {
                return;
            }

            // Rede de seguranca: o enabled do FileUploader ja bloqueia chamado encerrado.
            if (formatter.chamadoEncerrado(oContext.getProperty("status"))) {
                Log.info("Envio de anexo bloqueado: chamado encerrado",
                    String(oContext.getProperty("status") ?? ""),
                    "megawork.mwmonitorchamados.controller.Main");
                MessageToast.show(this._getResourceBundle().getText("detalheAnexoBloqueadoEncerrado"));
                return;
            }

            const aFiles = this._filtrarAnexosPermitidos(
                Array.from(oEvent.getParameter("files") ?? []));

            if (!aFiles.length) {
                oUploader.setValue("");
                return;
            }

            const oBundle = this._getResourceBundle();
            const oTicketsModel = oContext.getModel();
            const sPathTicket = oContext.getPath();
            const sId = String(oTicketsModel.getProperty(sPathTicket + "/ID") ?? "").trim();

            // Mesmo teto do wizard, e pelo mesmo motivo: as leituras base64 comecam TODAS no mesmo
            // tick, entao um Ctrl+A numa pasta de prints deixaria centenas de MB de string vivos na
            // aba antes do primeiro POST. As vagas contam o que ainda esta em voo, nao o total do
            // chamado - o C4C nao limita a quantidade de anexos.
            const iVagas = Math.max(MAX_ANEXOS_PENDENTES
                - (oTicketsModel.getProperty(sPathTicket + "/anexos") ?? [])
                    .filter((oLinha) => oLinha.enviando === true).length, 0);

            if (aFiles.length > iVagas) {
                MessageToast.show(oBundle.getText("criarChamadoAnexoLimiteQuantidade",
                    [String(MAX_ANEXOS_PENDENTES)]));
            }

            if (!iVagas) {
                oUploader.setValue("");
                return;
            }

            // A leitura base64 comeca ANTES do setValue("") abaixo: o objeto File morre quando o
            // FileUploader e limpo, e o que sobrevive ate o POST e a promise, nao o File.
            const aPendentes = aFiles.slice(0, iVagas).map((oFile) => ({
                nome: oFile.name,
                mimeType: oFile.type || MIME_TYPE_PADRAO_ANEXO,
                tamanho: this._formatarTamanhoArquivo(oFile.size),
                pBase64: this._lerAnexoComoBase64(oFile)
            }));

            // Limpa o value para o mesmo arquivo poder ser reselecionado depois (com
            // sameFilenameAllowed, e o que faz o change disparar de novo).
            oUploader.setValue("");

            const aLinhasOtimistas = aPendentes.map((oAnexo) => ({
                objectID: "",
                nome: oAnexo.nome,
                mimeType: oAnexo.mimeType,
                tamanho: oAnexo.tamanho,
                autor: "",
                quando: this._agoraIso(),
                baixando: false,
                enviando: true,
                origemC4C: false
            }));

            // Array novo: push in place nao reavalia formatter.contagem nem o noData da List.
            oTicketsModel.setProperty(sPathTicket + "/anexos",
                (oTicketsModel.getProperty(sPathTicket + "/anexos") ?? []).concat(aLinhasOtimistas));
            oTicketsModel.setProperty(sPathTicket + "/anexosEnviando", true);

            this._resolverObjectIDdoTicket(oTicketsModel, sPathTicket, sId)
                .then((sObjectID) => {
                    if (!sObjectID) {
                        return { iEnviados: 0, aFalharam: aPendentes.map((oAnexo) => oAnexo.nome) };
                    }

                    return this._enviarAnexosAoChamado(sObjectID, aPendentes);
                })
                .then((oEnvio) => {
                    if (!this._ehChamadoNoDetalhe(sId)) {
                        return;
                    }

                    if (!oEnvio.aFalharam.length) {
                        MessageToast.show(oEnvio.iEnviados === 1
                            ? oBundle.getText("detalheAnexoEnviadoUm")
                            : oBundle.getText("detalheAnexoEnviadoVarios", [String(oEnvio.iEnviados)]));
                    } else if (!oEnvio.iEnviados) {
                        MessageToast.show(oBundle.getText("detalheAnexoErroEnviar"));
                    } else {
                        // Parcial com os nomes: generico nao serve, o usuario precisa saber o que
                        // reenviar.
                        MessageToast.show(oBundle.getText("detalheAnexoEnvioParcial",
                            [String(oEnvio.iEnviados), String(aPendentes.length),
                                oEnvio.aFalharam.join(", ")]));
                    }
                })
                .catch((oError) => {
                    // _enviarAnexosAoChamado nunca rejeita: aqui so cai falha de infra (o
                    // _resolverObjectIDdoTicket, por exemplo).
                    Log.error("Falha ao anexar arquivos ao chamado " + sId, oError,
                        "megawork.mwmonitorchamados.controller.Main");

                    if (this._ehChamadoNoDetalhe(sId)) {
                        MessageToast.show(oBundle.getText("detalheAnexoErroEnviar"));
                    }
                })
                .finally(() => {
                    const sPathAtual = this._pathDoChamadoPorId(oTicketsModel, sId);

                    if (sPathAtual) {
                        // As linhas otimistas saem por REFERENCIA, nao por enviando === true: outro
                        // envio em voo no mesmo chamado tem linhas proprias, que devem ficar.
                        oTicketsModel.setProperty(sPathAtual + "/anexos",
                            (oTicketsModel.getProperty(sPathAtual + "/anexos") ?? [])
                                .filter((oLinha) => aLinhasOtimistas.indexOf(oLinha) < 0));
                        oTicketsModel.setProperty(sPathAtual + "/anexosEnviando", false);
                        // A flag cai mesmo se o usuario ja saiu da tela: as linhas otimistas
                        // acabaram de ser removidas, entao sem isso a proxima abertura do detalhe
                        // veria "ja carregado" e o arquivo que subiu ficaria invisivel.
                        oTicketsModel.setProperty(sPathAtual + "/anexosCarregado", false);
                    }

                    this._recarregarAnexosDoDetalhe(sId);
                });
        },

        // Envia os anexos EM SERIE, um POST HTTP por arquivo. NUNCA rejeita: o chamado ja existe e
        // nao ha rollback, entao quem relata o parcial e o chamador, com contagem e nomes.
        _enviarAnexosAoChamado(sParentObjectID, aAnexos) {
            const oResultado = { iEnviados: 0, aFalharam: [] };

            return aAnexos.reduce((pAnterior, oAnexo) => pAnterior.then(() =>
                this._criarAnexoNoC4C(sParentObjectID, oAnexo)
                    .then(() => {
                        oResultado.iEnviados += 1;
                    })
                    .catch((oError) => {
                        Log.error("Falha ao enviar o anexo " + oAnexo.nome, oError,
                            "megawork.mwmonitorchamados.controller.Main");
                        oResultado.aFalharam.push(oAnexo.nome);
                    })
            ), Promise.resolve()).then(() => oResultado);
        },

        // Unico POST de anexo do app: serve o wizard e o detalhe.
        _criarAnexoNoC4C(sParentObjectID, oAnexo) {
            return oAnexo.pBase64.then((sBase64) => {
                // A promise de leitura nunca rejeita: base64 vazio E a sinalizacao de falha.
                if (!sBase64) {
                    return Promise.reject(new Error("Anexo " + oAnexo.nome + " sem conteudo legivel"));
                }

                // $$updateGroupId "$direct": no grupo default os creates pendentes entrariam no
                // MESMO $batch e dois arquivos de 10 MB somariam ~27 MB de corpo, acima do
                // body_parser.limit de 15mb do servico - os dois voltariam 413 juntos.
                const oListBinding = this.getOwnerComponent().getModel().bindList(
                    "/ServiceRequestAttachmentFolders", undefined, undefined, undefined,
                    { $$updateGroupId: "$direct" });
                // CategoryCode nao vai daqui: o default e do servidor, fonte unica do code.
                const oContext = oListBinding.create({
                    ParentObjectID: sParentObjectID,
                    Name: oAnexo.nome,
                    MimeType: oAnexo.mimeType,
                    Binary: sBase64
                }, true);

                return oContext.created()
                    .then(() => true)
                    .finally(() => oListBinding.destroy());
            });
        },

        // Forca a releitura dos anexos do chamado que esta na tela: e ela que troca as linhas
        // otimistas pelas do C4C, com objectID e portanto baixaveis. Devolve o promise da leitura
        // para quem precisa esperar por ela (ver onDetalheAtualizar); os chamadores antigos
        // continuam podendo ignorar o retorno.
        _recarregarAnexosDoDetalhe(sId) {
            if (!this._ehChamadoNoDetalhe(sId)) {
                return Promise.resolve(false);
            }

            const oContext = this._paginaDetalhe()?.getBindingContext("tickets");

            if (!oContext) {
                return Promise.resolve(false);
            }

            const oTicketsModel = oContext.getModel();
            const sPathTicket = oContext.getPath();

            oTicketsModel.setProperty(sPathTicket + "/anexosCarregado", false);
            // A leitura da abertura do detalhe pode ainda estar em voo (chat, historico e anexos
            // saem no MESMO $batch e o C4C leva segundos, enquanto o POST do anexo vai em $direct e
            // volta antes): sem a pendencia, _carregarAnexosDoTicket sairia pela guarda de leitura
            // em voo e a lista pre-upload ficaria latchada com anexosCarregado = true.
            oTicketsModel.setProperty(sPathTicket + "/anexosRelerPendente", true);

            return this._carregarAnexosDoTicket(oContext);
        },

        onDetalheEscalonar() {
            const oContext = this._paginaDetalhe().getBindingContext("tickets");

            if (!oContext) {
                return;
            }

            this._registrarHistoricoDetalhe(oContext, "Chamado escalonado");
            MessageToast.show(this._getResourceBundle().getText("detalheEscalonar"));
        },

        onDetalheResponsavelChange(oEvent) {
            const sResponsavelId = oEvent.getParameter("selectedItem")?.getKey()
                ?? oEvent.getSource().getSelectedKey();
            const oContext = oEvent.getSource().getBindingContext("tickets");

            if (!oContext) {
                return;
            }

            oContext.getModel().setProperty(oContext.getPath() + "/responsavelId", sResponsavelId);

            this._registrarHistoricoDetalhe(oContext, "Responsável alterado");
            MessageToast.show(this._getResourceBundle().getText("detalheResponsavel"));
        },

        onDetalheFinalizarChamado() {
            const oContext = this._paginaDetalhe().getBindingContext("tickets");

            if (!oContext) {
                return;
            }

            this._atualizarStatusChamado(oContext, "5", "Finalizado");
        },

        onDetalheCancelarChamado() {
            const oContext = this._paginaDetalhe().getBindingContext("tickets");

            if (!oContext) {
                return;
            }

            this._atualizarStatusChamado(oContext, "6", "Cancelado");
        },

        // Dialogo ja preenchido com o chamado da tela: o requisitante so revisa antes de escalar.
        async onDetalheAbrirChamadoSap() {
            const oContext = this._paginaDetalhe().getBindingContext("tickets");

            if (!oContext) {
                return;
            }

            // Requisitante do CHAMADO, nao o usuario logado: e o S-User dele que vai no Customer do caso SAP.
            const sRequisitante = String(oContext.getProperty("buyerMainContactPartyName") ?? "").trim();
            // Chave do contato: o nome tem homonimo no C4C, entao e o ID que aponta o S-User certo.
            const sRequisitanteContatoId = String(oContext.getProperty("buyerMainContactPartyId") ?? "").trim();
            const sBuyerPartyId = String(oContext.getProperty("buyerPartyId") ?? "").trim();
            // Resolvido na carga da lista: so chamado criado nesta sessao (ou lote que falhou)
            // chega aqui sem numero e precisa da consulta unitaria.
            const sCustomerNbr = String(oContext.getProperty("customerNbr") ?? "").trim();
            const sComponenteSapId = String(oContext.getProperty("componenteSapId") ?? "").trim();

            this._modeloChamadoSap().setData({
                origemId: String(oContext.getProperty("ID") ?? "").trim(),
                // Chave do PATCH do componente: origemId e o ID visivel e nao acha o header no C4C.
                objectID: String(oContext.getProperty("objectID") ?? "").trim(),
                origemTitulo: String(oContext.getProperty("titulo") ?? "").trim(),
                titulo: String(oContext.getProperty("titulo") ?? "").trim(),
                descricao: String(oContext.getProperty("descricao") ?? "").trim(),
                // NORMAL no fallback e nao BAIXA: codigo desconhecido nao e motivo para abrir o
                // caso na menor prioridade do enum da SAP.
                prioridade: PRIORIDADE_CHAMADO_DO_C4C[String(oContext.getProperty("prioridade") ?? "").trim()]
                    ?? "NORMAL",
                ambiente: null,
                // O C4C guarda so o id do componente; chave/descricao so aparecem no value help.
                componenteSap: sComponenteSapId ? { id: sComponenteSapId, chave: "", descricao: "" } : null,
                // Base da comparacao no confirmar: sem ela o PATCH iria sem o usuario trocar nada.
                componenteSapOriginal: sComponenteSapId,
                // buyerPartyId fica no modelo para a resposta lenta saber se ainda e o chamado dela.
                buyerPartyId: sBuyerPartyId,
                customerNbr: sCustomerNbr,
                customerNome: sCustomerNbr
                    ? String(oContext.getProperty("customerNome") ?? "").trim()
                    : "",
                // Nao nasce carregando quando a linha ja trouxe o numero: o campo apareceria com
                // spinner e "Consultando cliente..." para um dado que ja esta na mao.
                customerCarregando: !sCustomerNbr,
                customerFalha: false,
                requisitante: sRequisitante,
                // Guard da resposta lenta: sem o ID, dois homonimos passariam um pelo outro.
                requisitanteContatoId: sRequisitanteContatoId,
                sUser: "",
                sUserNome: "",
                // Nasce carregando para o campo nao piscar "nao encontrado" antes da consulta.
                sUserCarregando: true,
                sUserFalha: false,
                // sUserLogado*: S-User do usuario logado, diferente de sUser* (contato do chamado).
                sUserLogado: "",
                sUserLogadoNome: "",
                sUserLogadoCarregando: true,
                sUserLogadoFalha: false,
                enviando: false
            });

            // Promise cacheado: loadFragment pendura o dialogo nos dependents da view uma vez so.
            if (!this._pDialogChamadoSap) {
                // Limpa no erro: cachear a rejeicao deixaria o botao morto pelo resto da sessao.
                this._pDialogChamadoSap = this.loadFragment({
                    name: "megawork.mwmonitorchamados.view.AbrirChamadoSap"
                }).catch((oError) => {
                    this._pDialogChamadoSap = undefined;
                    throw oError;
                });
            }

            try {
                (await this._pDialogChamadoSap).open();
            } catch (oError) {
                Log.error("Falha ao carregar o dialogo de abertura de chamado SAP", oError,
                    "megawork.mwmonitorchamados.controller.Main");
                MessageToast.show(this._getResourceBundle().getText("abrirChamadoSapErroDialogo"));
                return;
            }

            // Sem await: o S-User e so informativo e nao pode segurar a abertura do dialogo.
            this._carregarSUserChamadoSap(sRequisitanteContatoId, sRequisitante);
            this._carregarSUserLogadoChamadoSap();
            // Guardado porque onAbrirAmbientesSap precisa esperar por ele antes de consultar.
            this._pClienteChamadoSap = sCustomerNbr
                ? Promise.resolve()
                : this._carregarClienteChamadoSap(sBuyerPartyId);
        },

        // Falha nao abre MessageBox: o status ao lado do campo avisa e o dialogo segue util.
        _carregarClienteChamadoSap(sBuyerPartyId) {
            const oModelo = this._modeloChamadoSap();

            oModelo.setProperty("/customerCarregando", true);
            oModelo.setProperty("/customerFalha", false);

            // Chamado sem BuyerPartyID nao tem chave de busca: "nao encontrado" e o estado honesto,
            // e evita um 400 fixo no backend. Encerra o carregando ou o campo gira para sempre.
            if (!sBuyerPartyId) {
                oModelo.setProperty("/customerNbr", "");
                oModelo.setProperty("/customerNome", "");
                oModelo.setProperty("/customerCarregando", false);

                return Promise.resolve();
            }

            return this._consultarClienteSap(sBuyerPartyId)
                .then((oResultado) => {
                    // Reabrir noutro chamado antes da resposta traria o cliente do chamado velho.
                    if (oModelo.getProperty("/buyerPartyId") !== sBuyerPartyId) {
                        return;
                    }

                    const sCustomerNumber = String(oResultado?.customerNumber ?? "");

                    oModelo.setProperty("/customerNbr", sCustomerNumber);
                    // Nome SO com numero: sem isso um nome sozinho esconderia que o cliente nao
                    // tem customerNumber, e o dialogo de ambientes nao teria o que consultar.
                    oModelo.setProperty("/customerNome",
                        sCustomerNumber ? (oResultado?.nome ?? "") : "");
                    oModelo.setProperty("/customerFalha", oResultado?.falha === true);
                })
                .catch((oError) => {
                    // _consultarClienteSap nao deixa rejeitar; sobra erro ao escrever o modelo.
                    Log.error("Falha ao exibir o cliente do chamado", oError,
                        "megawork.mwmonitorchamados.controller.Main");
                    oModelo.setProperty("/customerNbr", "");
                    oModelo.setProperty("/customerNome", "");
                    oModelo.setProperty("/customerFalha", true);
                })
                .finally(() => {
                    // So a resposta do chamado atual apaga o busy: a do chamado anterior faria o
                    // campo dizer "nao encontrado" enquanto a consulta boa ainda esta em voo.
                    if (oModelo.getProperty("/buyerPartyId") === sBuyerPartyId) {
                        oModelo.setProperty("/customerCarregando", false);
                    }
                });
        },

        // Resolve SEMPRE {customerNumber, nome, falha}: quem le trata falha e vazio de formas diferentes.
        _consultarClienteSap(sBuyerPartyId) {
            let oOperation = null;

            return Promise.resolve()
                .then(() => {
                    // $direct: o GET cru no C4C e lento e no $batch default seguraria a lista.
                    oOperation = this.getOwnerComponent().getModel().bindContext("/ClienteSap(...)",
                        null, { $$groupId: "$direct" });
                    oOperation.setParameter("businessPartnerId", sBuyerPartyId);

                    return oOperation.invoke();
                })
                .then(() => oOperation.getBoundContext().requestObject())
                .then((oCliente) => ({
                    customerNumber: String(oCliente?.customerNumber ?? "").trim(),
                    nome: String(oCliente?.nome ?? "").trim(),
                    // O handler engole a falha do C4C e responde 200: o flag dele e a unica
                    // pista de que o vazio veio de integracao caida, nao de cadastro.
                    falha: oCliente?.falha === true
                }))
                .catch((oError) => {
                    // warning, nao error: mesma classe de evento do _consultarSUserDoRequisitante.
                    Log.warning(`Falha ao resolver o cliente do BusinessPartner ${sBuyerPartyId}`, oError,
                        "megawork.mwmonitorchamados.controller.Main");

                    // So 404 e cadastro: acusar cadastro por queda de integracao manda o usuario
                    // abrir chamado de um problema que nao existe.
                    return {
                        customerNumber: "",
                        nome: "",
                        falha: Number(oError?.status ?? oError?.error?.code ?? 0) !== 404
                    };
                })
                .finally(() => {
                    oOperation?.destroy();
                });
        },

        // Espelha o campo do cliente, mas pelo e-mail do login: o ContatoSap ja fixa o customer.
        _carregarSUserLogadoChamadoSap() {
            const oModelo = this._modeloChamadoSap();
            // O toggle de e-mail dev nao fecha o dialogo: sem esta marca a resposta lenta do
            // usuario anterior escreveria o S-User dele no campo do usuario novo.
            const iGeracao = this._iGeracaoRequisitante;

            oModelo.setProperty("/sUserLogadoCarregando", true);
            oModelo.setProperty("/sUserLogadoFalha", false);

            return this._lerSUserRequisitante()
                .then((oResultado) => {
                    if (iGeracao !== this._iGeracaoRequisitante) {
                        return;
                    }

                    const sSUser = String(oResultado?.sUser ?? "");

                    oModelo.setProperty("/sUserLogado", sSUser);
                    // Sem nome na ALM o e-mail cobre; fallback SO com S-User, igual ao do cliente.
                    oModelo.setProperty("/sUserLogadoNome",
                        sSUser ? (oResultado?.primeiroNome || oResultado?.email || "") : "");
                    oModelo.setProperty("/sUserLogadoFalha", oResultado?.falha === true);
                })
                .catch((oError) => {
                    // _memoizarSUserRequisitante nao deixa rejeitar; sobra erro ao escrever o modelo.
                    Log.warning("Falha ao exibir o S-User do usuario logado", oError,
                        "megawork.mwmonitorchamados.controller.Main");
                    oModelo.setProperty("/sUserLogado", "");
                    oModelo.setProperty("/sUserLogadoNome", "");
                    oModelo.setProperty("/sUserLogadoFalha", true);
                })
                .finally(() => {
                    oModelo.setProperty("/sUserLogadoCarregando", false);
                });
        },

        // Falha nao abre MessageBox: o campo fica com o aviso e o resto do dialogo segue util.
        _carregarSUserChamadoSap(sContatoId, sRequisitante) {
            const oModelo = this._modeloChamadoSap();

            oModelo.setProperty("/sUserCarregando", true);
            oModelo.setProperty("/sUserFalha", false);

            // Sem chave NEM nome nao ha por onde comecar a cadeia; "nao encontrado" e o estado
            // honesto, e evita o 400 fixo do backend (que so recusa quando os dois faltam).
            if (!sContatoId && !sRequisitante) {
                oModelo.setProperty("/sUser", "");
                oModelo.setProperty("/sUserNome", "");
                oModelo.setProperty("/sUserCarregando", false);

                return Promise.resolve();
            }

            return this._lerSUserPorRequisitante(sContatoId, sRequisitante)
                .then((oResultado) => {
                    // Compara a identidade da consulta, nao o rotulo: reabrir noutro chamado antes
                    // da resposta traria o S-User do requisitante velho.
                    if (oModelo.getProperty("/requisitanteContatoId") !== sContatoId
                        || oModelo.getProperty("/requisitante") !== sRequisitante) {
                        return;
                    }

                    const sSUser = String(oResultado?.sUser ?? "");

                    oModelo.setProperty("/sUser", sSUser);
                    // Sem nome na ALM o status cairia em "nao encontrado" com o S-User no campo; o
                    // nome do header cobre. Fallback SO com S-User, senao esconderia o nao-achou.
                    oModelo.setProperty("/sUserNome",
                        sSUser ? (oResultado?.primeiroNome || sRequisitante) : "");
                    oModelo.setProperty("/sUserFalha", oResultado?.falha === true);
                })
                .catch((oError) => {
                    // _lerSUserPorRequisitante nao deixa rejeitar; sobra erro ao escrever o modelo.
                    Log.warning("Falha ao exibir o S-User do requisitante", oError,
                        "megawork.mwmonitorchamados.controller.Main");
                    oModelo.setProperty("/sUser", "");
                    oModelo.setProperty("/sUserNome", "");
                    oModelo.setProperty("/sUserFalha", true);
                })
                .finally(() => {
                    // Mesmo guard do .then: a resposta lenta do chamado anterior zerando o busy
                    // faria o dialogo atual dizer "nao encontrado" com a consulta ainda em voo.
                    if (oModelo.getProperty("/requisitanteContatoId") === sContatoId
                        && oModelo.getProperty("/requisitante") === sRequisitante) {
                        oModelo.setProperty("/sUserCarregando", false);
                    }
                });
        },

        // Cache por requisitante: dois chamados do mesmo contato nao repagam a varredura da ALM.
        _lerSUserPorRequisitante(sContatoId, sRequisitante) {
            this._mSUserPorRequisitante ??= new Map();

            // Chave pelo contatoId quando existir, em namespace proprio: chavear pelo nome faria dois
            // homonimos dividirem a entrada e a primeira resposta venceria. O nome entra junto porque
            // a chave pode nao resolver e o backend cair no fallback por nome.
            const sChave = sContatoId
                ? ("id:" + sContatoId + "|" + sRequisitante)
                : ("nome:" + sRequisitante);
            const pCacheada = this._mSUserPorRequisitante.get(sChave);

            if (pCacheada) {
                return pCacheada;
            }

            const pSUser = this._consultarSUserDoRequisitante(sContatoId, sRequisitante);

            this._mSUserPorRequisitante.set(sChave, pSUser);

            pSUser.then((oResultado) => {
                // Falha de integracao cacheada deixaria o campo em erro pela sessao inteira sem
                // retentar; 404 e cadastro e continua valendo.
                if (oResultado.falha === true && this._mSUserPorRequisitante.get(sChave) === pSUser) {
                    this._mSUserPorRequisitante.delete(sChave);
                }
            });

            return pSUser;
        },

        // Resolve SEMPRE {sUser, primeiroNome, falha}: promise cacheada que rejeita vira unhandled rejection.
        _consultarSUserDoRequisitante(sContatoId, sRequisitante) {
            let oOperation = null;

            return Promise.resolve()
                .then(() => {
                    // $direct: no $batch default a varredura paginada de contatos seguraria a lista.
                    oOperation = this.getOwnerComponent().getModel()
                        .bindContext("/ContatoSapDoRequisitante(...)", null, { $$groupId: "$direct" });
                    // Os dois: o backend resolve pela chave e cai no nome quando o chamado antigo
                    // nao tem BuyerMainContactPartyID.
                    oOperation.setParameter("contatoId", sContatoId);
                    oOperation.setParameter("nome", sRequisitante);

                    return oOperation.invoke();
                })
                .then(() => oOperation.getBoundContext().requestObject())
                .then((oContato) => ({
                    sUser: String(oContato?.sUser ?? "").trim(),
                    primeiroNome: String(oContato?.primeiroNome ?? "").trim(),
                    falha: false
                }))
                .catch((oError) => {
                    Log.warning("Falha ao resolver o S-User do requisitante "
                        + `${sContatoId || "(sem contatoId)"} / ${sRequisitante || "(sem nome)"}`, oError,
                        "megawork.mwmonitorchamados.controller.Main");

                    // So 404 e cadastro: acusar cadastro por queda de integracao manda o usuario
                    // abrir chamado de um problema que nao existe.
                    return {
                        sUser: "",
                        primeiroNome: "",
                        falha: Number(oError?.status ?? oError?.error?.code ?? 0) !== 404
                    };
                })
                .finally(() => {
                    oOperation?.destroy();
                });
        },

        // Cache do prefetch do executor, ou consulta memoizada se ele nao rodou.
        _lerSUserRequisitante() {
            return this._pSUserRequisitante || this._memoizarSUserRequisitante(
                this._lerUsuarioLogado().then((sEmail) => this._consultarSUser(sEmail)));
        },

        // Guarda de geracao: carga antiga atrasada nao sobrescreve o cache do usuario novo.
        _prefetchSUserRequisitante(sEmail, iGeracao) {
            if (iGeracao !== this._iGeracaoRequisitante) {
                return;
            }

            this._memoizarSUserRequisitante(this._consultarSUser(sEmail));
        },

        // Cacheia a consulta e descarta SO a falha: erro de integracao preso no cache deixaria o
        // campo em erro pela sessao inteira sem retentar (404 e cadastro, esse fica cacheado).
        _memoizarSUserRequisitante(pOrigem) {
            // Promise cacheada sem consumidor: um reject vira unhandled rejection.
            const pSUser = pOrigem.catch((oError) => {
                Log.warning("Falha ao resolver o S-User do requisitante", oError,
                    "megawork.mwmonitorchamados.controller.Main");

                return { sUser: "", primeiroNome: "", email: "", falha: true };
            });

            this._pSUserRequisitante = pSUser;

            pSUser.then((oResultado) => {
                if (oResultado.falha === true && this._pSUserRequisitante === pSUser) {
                    this._pSUserRequisitante = null;
                }
            });

            return pSUser;
        },

        // Resolve SEMPRE {sUser, primeiroNome, email, falha}: como promise cacheada, um reject sem
        // consumidor viraria unhandled rejection e derrubaria a cadeia do requisitante.
        _consultarSUser(sEmail) {
            let oOperation = null;

            return Promise.resolve()
                .then(() => {
                    // ContatoSap resolve SO por e-mail: sem ele a chamada voltaria 400 fixo.
                    if (!sEmail) {
                        throw new Error("Usuario logado sem e-mail");
                    }

                    // $direct: no $batch default a varredura paginada de contatos seguraria a lista.
                    oOperation = this.getOwnerComponent().getModel().bindContext("/ContatoSap(...)",
                        null, { $$groupId: "$direct" });
                    oOperation.setParameter("email", sEmail);

                    return oOperation.invoke();
                })
                .then(() => oOperation.getBoundContext().requestObject())
                .then((oContato) => ({
                    sUser: String(oContato?.sUser ?? "").trim(),
                    primeiroNome: String(oContato?.primeiroNome ?? "").trim(),
                    email: sEmail,
                    falha: false
                }))
                .catch((oError) => {
                    Log.warning("Falha ao resolver o S-User do requisitante", oError,
                        "megawork.mwmonitorchamados.controller.Main");

                    // So 404 e cadastro: acusar cadastro por queda de integracao manda o usuario
                    // abrir chamado de um problema que nao existe.
                    return {
                        sUser: "",
                        primeiroNome: "",
                        email: sEmail,
                        falha: Number(oError?.status ?? oError?.error?.code ?? 0) !== 404
                    };
                })
                .finally(() => {
                    oOperation?.destroy();
                });
        },

        // Modelo na view, nao no fragmento: sobrevive ao ciclo de vida do dialogo.
        _modeloChamadoSap() {
            let oModelo = this.getView().getModel("chamadoSap");

            if (!oModelo) {
                oModelo = new JSONModel({});
                this.getView().setModel(oModelo, "chamadoSap");
            }

            return oModelo;
        },

        onAbrirComponentesChamadoSap() {
            this._abrirComponentesSap("chamadoSap");
        },

        // Irmao do onLimparComponenteSap: aquele e fixo em "novoChamado" e limparia o wizard.
        onLimparComponenteChamadoSap() {
            this._modeloChamadoSap().setProperty("/componenteSap", null);
        },

        onFecharAbrirChamadoSap() {
            this.byId("dialogAbrirChamadoSap")?.close();
        },

        // Chaves = nomes dos parametros da action AbrirCasoSap. sUserCliente vem de /sUser (rotulo
        // "S-User Cliente") e sUserRequisitante de /sUserLogado: trocar os dois abre o caso no nome errado.
        _dadosCasoSapDoDialogo(oDados) {
            return {
                prioridade: String(oDados.prioridade ?? "").trim(),
                componenteId: String(oDados.componenteSap?.id ?? "").trim(),
                customerNumber: String(oDados.customerNbr ?? "").trim(),
                installationNumber: String(oDados.ambiente?.installationNbr ?? "").trim(),
                systemNbr: String(oDados.ambiente?.systemNbr ?? "").trim(),
                titulo: String(oDados.titulo ?? "").trim(),
                descricao: String(oDados.descricao ?? "").trim(),
                sUserCliente: String(oDados.sUser ?? "").trim(),
                sUserRequisitante: String(oDados.sUserLogado ?? "").trim()
            };
        },

        // Devolve a chave i18n do primeiro campo faltando, na ordem da tela, ou "" quando pode enviar.
        // sUserCliente fica de fora: e o customer do caso, opcional no contrato da SAP.
        _validarCasoSap(oCaso) {
            if (!oCaso.titulo) {
                return "abrirChamadoSapErroTitulo";
            }

            if (!oCaso.descricao) {
                return "abrirChamadoSapErroDescricao";
            }

            if (!oCaso.componenteId) {
                return "abrirChamadoSapErroComponente";
            }

            // Os DOIS numeros, nao so o objeto /ambiente: o backend normaliza com String(x ?? "")
            // e um ambiente escolhido pode chegar com numero vazio.
            if (!oCaso.installationNumber || !oCaso.systemNbr) {
                return "abrirChamadoSapErroAmbiente";
            }

            if (!oCaso.customerNumber) {
                return "abrirChamadoSapErroCliente";
            }

            if (!oCaso.sUserRequisitante) {
                return "abrirChamadoSapErroSUserRequisitante";
            }

            return "";
        },

        // Chama a action AbrirCasoSap, que cria caso REAL no SAP Cloud ALM: o POST nao tem chave de
        // deduplicacao, entao nada aqui pode reenviar sozinho depois de falha ou timeout.
        async onConfirmarChamadoSap() {
            // Trava de re-entrancia: o busy do dialogo cai no finally e um segundo clique abriria
            // um segundo caso real na SAP, que nao da para desfazer.
            if (this._bAbrindoCasoSap) {
                return;
            }

            this._bAbrindoCasoSap = true;

            const oBundle = this._getResourceBundle();
            const oModelo = this._modeloChamadoSap();
            let oOperation = null;

            try {
                // Antes do await: sem a trava ligada o dialogo segue clicavel durante a espera do
                // cliente, e Cancelar ali deixaria o envio correndo por baixo ate criar o caso.
                oModelo.setProperty("/enviando", true);

                // Identidade de quem clicou: reabrir o dialogo reusa o mesmo JSONModel, entao sem
                // isso o envio pendente continuaria com os dados meio digitados do outro chamado.
                const sOrigemId = String(oModelo.getProperty("/origemId") ?? "").trim();

                // Cliente e S-User sao resolvidos DEPOIS da abertura do dialogo: enviar sem esperar
                // mandaria customerNumber/reporter vazios e a SAP recusaria com 400 generico.
                await this._pClienteChamadoSap;

                if (String(oModelo.getProperty("/origemId") ?? "").trim() !== sOrigemId
                    || this.byId("dialogAbrirChamadoSap")?.isOpen() !== true) {
                    Log.warning("Abertura de chamado SAP abandonada: o dialogo mudou durante a espera",
                        sOrigemId, "megawork.mwmonitorchamados.controller.Main");
                    return;
                }

                // sUserCarregando junto: e a consulta mais lenta das tres e alimenta o customer do
                // caso, entao enviar antes dela montaria o payload sem o contato do cliente.
                if (oModelo.getProperty("/customerCarregando")
                    || oModelo.getProperty("/sUserCarregando")
                    || oModelo.getProperty("/sUserLogadoCarregando")) {
                    MessageBox.error(oBundle.getText("abrirChamadoSapAguardeCarregando"));
                    return;
                }

                // Lido uma vez so: reler depois do await pegaria edicao feita no meio do envio.
                const oCaso = this._dadosCasoSapDoDialogo(oModelo.getData());
                const sChaveErro = this._validarCasoSap(oCaso);

                if (sChaveErro) {
                    MessageBox.error(oBundle.getText(sChaveErro));
                    return;
                }

                // Alvo do PATCH congelado junto do payload: o dialogo pode trocar de chamado
                // enquanto o POST corre, e reler o modelo depois acertaria o header errado.
                const sObjectID = String(oModelo.getProperty("/objectID") ?? "").trim();
                const sComponenteOriginal = String(oModelo.getProperty("/componenteSapOriginal") ?? "").trim();

                // $direct: escrita lenta na ALM nao pode segurar o $batch do resto do dialogo.
                oOperation = this.getOwnerComponent().getModel()
                    .bindContext("/AbrirCasoSap(...)", null, { $$groupId: "$direct" });

                // Nome por nome, sem laco: os parametros sao o contrato da action e o par
                // sUserCliente/sUserRequisitante e facil de inverter sem ver os dois lado a lado.
                oOperation.setParameter("prioridade", oCaso.prioridade);
                oOperation.setParameter("componenteId", oCaso.componenteId);
                oOperation.setParameter("customerNumber", oCaso.customerNumber);
                oOperation.setParameter("installationNumber", oCaso.installationNumber);
                oOperation.setParameter("systemNbr", oCaso.systemNbr);
                oOperation.setParameter("titulo", oCaso.titulo);
                oOperation.setParameter("descricao", oCaso.descricao);
                oOperation.setParameter("sUserCliente", oCaso.sUserCliente);
                oOperation.setParameter("sUserRequisitante", oCaso.sUserRequisitante);

                await oOperation.invoke();

                const oResultado = await oOperation.getBoundContext().requestObject();
                const sCorrelationId = String(oResultado?.correlationId ?? "").trim();
                const sCaseNumber = String(oResultado?.caseNumber ?? "").trim();

                // Sem a referencia nao ha como reabrir o caso: avisa que ele PODE existir em vez de
                // dar sucesso mudo, porque um novo envio as cegas duplicaria o registro na SAP.
                if (!sCorrelationId) {
                    throw new Error(oBundle.getText("abrirChamadoSapErroSemReferencia"));
                }

                // PATCH do componente so agora: POST recusado deixaria o C4C alterado sem caso na SAP.
                // Pulado no modo simulado do backend, que so blinda a ALM: sem isso o "teste sem
                // criar nada" ainda alteraria de verdade o header do chamado do cliente no C4C.
                const sResultadoComponente = sCorrelationId.startsWith("SIMULADO-")
                    ? "nada"
                    : await this._propagarComponenteChamadoSap(
                        sObjectID, oCaso.componenteId, sComponenteOriginal);

                this._concluirCasoSapCriado(sCorrelationId, sCaseNumber, sResultadoComponente);
            } catch (oError) {
                this._falhaAoAbrirCasoSap(oError);
            } finally {
                oOperation?.destroy();
                oModelo.setProperty("/enviando", false);
                this._bAbrindoCasoSap = false;
            }
        },

        // Nao reenvia nada e nao fecha o dialogo: sem chave de deduplicacao, repetir o envio por
        // conta propria criaria um segundo caso real na SAP.
        _falhaAoAbrirCasoSap(oError) {
            const oBundle = this._getResourceBundle();
            const sDetalhe = String(oError?.message ?? "").trim();
            const iStatus = Number(oError?.status ?? 0);

            Log.error("Falha ao abrir o chamado SAP", oError,
                "megawork.mwmonitorchamados.controller.Main");

            // So 400/428 provam que o caso NAO nasceu (a ALM recusou o dado antes de gravar).
            // Timeout e 5xx podem ter criado o caso, e dizer "nao foi possivel" ali convida o
            // reenvio as cegas - que duplica registro real, porque o POST nao tem deduplicacao.
            const bRecusado = iStatus === 400 || iStatus === 428;
            const sManchete = bRecusado
                ? oBundle.getText("abrirChamadoSapErroCriar")
                : oBundle.getText("abrirChamadoSapErroIncerto");

            // Detalhe da SAP junto: a manchete sozinha esconde o campo recusado.
            MessageBox[bRecusado ? "error" : "warning"](sDetalhe
                ? sManchete + "\n\n" + sDetalhe
                : sManchete);
        },

        // So depois do caso existir na SAP: em erro o dialogo fica aberto para nao jogar fora o
        // texto digitado, e o caseNumber vazio nao invalida nada - o caso ja foi criado.
        _concluirCasoSapCriado(sCorrelationId, sCaseNumber, sResultadoComponente) {
            const oBundle = this._getResourceBundle();

            this.byId("dialogAbrirChamadoSap")?.close();

            const sTexto = sCaseNumber
                ? oBundle.getText("abrirChamadoSapCriado", [sCaseNumber])
                : oBundle.getText("abrirChamadoSapCriadoSemNumero", [sCorrelationId]);

            // Um MessageBox so, e nao toast: dois avisos encadeados soterrariam o numero do caso,
            // que e a unica chave util do registro criado.
            MessageBox.success(sResultadoComponente === "erro"
                ? sTexto + "\n\n" + oBundle.getText("abrirChamadoSapComponenteErro")
                : sTexto);

            Log.info("Caso SAP aberto", sCorrelationId + " / " + (sCaseNumber || "(numero pendente)"),
                "megawork.mwmonitorchamados.controller.Main");

            // Sem await: a falha da carga ja tem tratamento proprio e nao pode segurar a mensagem.
            this._carregarChamadosSap(true);
        },

        // Campo acessorio: falha aqui nao pode derrubar o chamado ja aberto, so avisa e fica logada.
        // Devolve "nada" | "ok" | "erro" porque quem chama decide a mensagem final da confirmacao.
        // Recebe o alvo por parametro em vez de reler o modelo: entre o clique e o fim do POST o
        // dialogo pode ter trocado de chamado, e o PATCH sairia contra o header errado.
        async _propagarComponenteChamadoSap(sObjectIDAlvo, sComponenteNovo, sComponenteOriginal) {
            const oModelo = this._modeloChamadoSap();
            const sObjectID = String(sObjectIDAlvo ?? "").trim();
            const sNovo = String(sComponenteNovo ?? "").trim();
            const sOriginal = String(sComponenteOriginal ?? "").trim();

            // So quando o requisitante realmente trocou: PATCH a toa gastaria uma escrita no C4C.
            if (sNovo === sOriginal) {
                return "nada";
            }

            // Trocou mas nao ha chave: sem o log a perda seria invisivel, porque a action que
            // reportaria "ObjectID nao informado" nem chega a ser chamada.
            if (!sObjectID) {
                Log.warning("Componente SAP nao propagado: chamado sem ObjectID", "",
                    "megawork.mwmonitorchamados.controller.Main");
                return "erro";
            }

            let oOperation = null;

            try {
                // $direct: escrita no C4C e lenta e no $batch default seguraria o resto do dialogo.
                oOperation = this.getOwnerComponent().getModel()
                    .bindContext("/AtualizarComponenteChamado(...)", null, { $$groupId: "$direct" });
                oOperation.setParameter("objectID", sObjectID);
                oOperation.setParameter("componenteId", sNovo);

                await oOperation.invoke();

                const oResultado = await oOperation.getBoundContext().requestObject();

                if (!oResultado || oResultado.falha === true || oResultado.atualizado !== true) {
                    Log.warning("Componente SAP nao propagado para o header do chamado " + sObjectID,
                        String(oResultado?.mensagem ?? ""), "megawork.mwmonitorchamados.controller.Main");
                    return "erro";
                }

                // Guard de reabertura, como os irmaos do dialogo: sem ele a resposta lenta do
                // chamado anterior reescreveria a base de comparacao do chamado ja aberto na tela.
                if (String(oModelo.getProperty("/objectID") ?? "").trim() === sObjectID) {
                    oModelo.setProperty("/componenteSapOriginal", sNovo);
                }

                this._espelharComponenteNaLinha(sObjectID, sNovo);

                return "ok";
            } catch (oError) {
                Log.warning("Falha ao propagar o componente SAP do chamado " + sObjectID, oError,
                    "megawork.mwmonitorchamados.controller.Main");

                return "erro";
            } finally {
                oOperation?.destroy();
            }
        },

        // Sem espelhar, reabrir o dialogo mostraria o componente antigo; o objectID e conferido
        // porque o usuario pode ter navegado enquanto o PATCH corria.
        _espelharComponenteNaLinha(sObjectID, sComponenteId) {
            const oContext = this._paginaDetalhe().getBindingContext("tickets");

            if (String(oContext?.getProperty("objectID") ?? "").trim() !== sObjectID) {
                return;
            }

            oContext.getModel().setProperty(oContext.getPath() + "/componenteSapId", sComponenteId);
        },

        async _atualizarStatusChamado(oContext, sStatus, sStatusTexto) {
            const oBundle = this._getResourceBundle();
            const sObjectID = String(oContext.getProperty("objectID") ?? "").trim();

            if (!sObjectID) {
                MessageToast.show(oBundle.getText("detalheErroSemObjectID") || "Erro: ObjectID não encontrado");
                return;
            }

            try {
                const oModel = this.getOwnerComponent().getModel();
                const sPath = "/ServiceRequests('" + String(sObjectID).replace(/'/g, "''") + "')";
                const oUpdateContext = oModel.bindContext(sPath).getBoundContext();

                await oUpdateContext.setProperty("ServiceRequestUserLifeCycleStatusCode", sStatus);

                oContext.getModel().setProperty(oContext.getPath() + "/status", sStatus);
                oContext.getModel().setProperty(oContext.getPath() + "/statusTexto", sStatusTexto);

                // A lista mostra a SITUACAO (ServiceRequestLifeCycleStatusCode) e o C4C move os dois
                // eixos junto: quem decide a situacao resultante e o tenant, dai a releitura.
                try {
                    const aSituacao = await Promise.all([
                        oUpdateContext.requestProperty("ServiceRequestLifeCycleStatusCode"),
                        oUpdateContext.requestProperty("ServiceRequestLifeCycleStatusCodeText")
                    ]);

                    if (aSituacao[0]) {
                        oContext.getModel().setProperty(oContext.getPath() + "/situacao", aSituacao[0]);
                        oContext.getModel().setProperty(oContext.getPath() + "/situacaoTexto",
                            aSituacao[1] ?? "");
                    }
                } catch (oErroSituacao) {
                    Log.error("Falha ao reler a situacao do chamado depois da atualizacao", oErroSituacao,
                        "megawork.mwmonitorchamados.controller.Main");
                }

                this._registrarHistoricoDetalhe(oContext, "Status alterado para " + sStatusTexto);

                MessageToast.show(oBundle.getText("detalheAtualizacaoSucesso") || "Chamado atualizado com sucesso");
            } catch (oError) {
                Log.error("Falha ao atualizar o status do chamado", oError,
                    "megawork.mwmonitorchamados.controller.Main");
                MessageBox.error(oBundle.getText("detalheErroAtualizacao") || "Erro ao atualizar o chamado");
            }
        },

        _prepararModelosDetalhe() {
            const oTickets = this.getOwnerComponent().getModel("tickets");

            oTickets.dataLoaded().then(() => {
                const aTickets = oTickets.getProperty("/Tickets") ?? [];

                this._normalizarTickets(aTickets);

                // the rows were mutated in place, so the bindings are refreshed by hand
                oTickets.setProperty("/Tickets", aTickets);
                oTickets.refresh(true);
            });
        },

        _normalizarTickets(aTickets) {
            const oBundle = this._getResourceBundle();

            aTickets.forEach((oTicket) => {
                oTicket.descricao ??= "";
                oTicket.resolvidoEm ??= "";
                oTicket.chat ??= [];
                oTicket.anexos ??= [];
                // anexosCarregado fica FORA daqui de proposito: undefined significa "nunca lido" e
                // o unico valor que alguem grava e true (ver _carregarAnexosDoTicket).
                oTicket.anexosCarregando ??= false;
                oTicket.anexosEnviando ??= false;
                oTicket.anexosRelerPendente ??= false;
                oTicket.historico ??= [{
                    autor: oBundle.getText("detalheHistoricoSistema"),
                    quando: oTicket.dataAbertura,
                    texto: oBundle.getText("detalheHistoricoAbertura"),
                    sistema: true
                }];
                oTicket.historicoCarregando ??= false;
            });

            return aTickets;
        },

        _registrarHistoricoDetalhe(oContext, sTexto) {
            const oModel = oContext.getModel();
            const sPath = oContext.getPath() + "/historico";
            const aHistorico = oModel.getProperty(sPath) ?? [];

            aHistorico.push({
                autor: this._sRequisitanteNome || this._getResourceBundle().getText("criarChamadoRequisitante"),
                quando: this._agoraIso(),
                texto: sTexto,
                sistema: false
            });
            oModel.setProperty(sPath, aHistorico);
        },

        // Horario LOCAL, igual ao resto do modelo (_paraIsoLocal): a string sai sem offset e
        // formatter.oDataDeTexto a reinterpreta como local, entao com toISOString a bolha de chat, a
        // linha de historico e o anexo em envio apareciam deslocados pelo fuso (UTC-3 => 3 h no
        // futuro), lado a lado com as linhas vindas do C4C, que estao certas.
        _agoraIso() {
            return this._paraIsoLocal(new Date());
        },

        onSubmitChamado() {
            this._finalizarChamado();
        },

        onCancelarChamado() {
            this._resetNovoChamado();

            this.byId("mainContents").to(this.createId("home"));
            this.byId("sideNavigation").setSelectedKey("home");
        },

        // Acumula os arquivos escolhidos em novoChamado>/anexos, a UNICA fonte de verdade dos
        // pendentes do wizard (nao ha campo do controller guardando arquivo).
        onAnexoChange(oEvent) {
            const oUploader = oEvent.getSource();
            const oNovoChamado = this.getView().getModel("novoChamado");
            const aFiles = this._filtrarAnexosPermitidos(
                Array.from(oEvent.getParameter("files") ?? []));
            const aAtuais = oNovoChamado.getProperty("/anexos") ?? [];

            if (aFiles.length) {
                const iVagas = Math.max(MAX_ANEXOS_PENDENTES - aAtuais.length, 0);

                if (aFiles.length > iVagas) {
                    MessageToast.show(this._getResourceBundle().getText(
                        "criarChamadoAnexoLimiteQuantidade", [String(MAX_ANEXOS_PENDENTES)]));
                }

                // Array novo: mutacao in place nao reavalia o visible do empty state nem o resumo
                // do passo de revisao. A leitura base64 comeca AQUI porque o objeto File morre
                // quando o FileUploader e limpo - o que sobrevive ate o envio e a promise.
                oNovoChamado.setProperty("/anexos", aAtuais.concat(
                    aFiles.slice(0, iVagas).map((oFile) => ({
                        nome: oFile.name,
                        mimeType: oFile.type || MIME_TYPE_PADRAO_ANEXO,
                        tamanho: this._formatarTamanhoArquivo(oFile.size),
                        pBase64: this._lerAnexoComoBase64(oFile)
                    }))));
            }

            // Limpa o value para o mesmo arquivo poder ser reselecionado depois de uma remocao.
            oUploader.setValue("");
        },

        onRemoverAnexo(oEvent) {
            const oNovoChamado = this.getView().getModel("novoChamado");
            const sPathAnexo = oEvent.getSource().getBindingContext("novoChamado")?.getPath();

            if (!sPathAnexo) {
                return;
            }

            // Um item so, pelo indice do path ("/anexos/2"): remover a lista inteira descartaria os
            // arquivos que o usuario quer manter.
            const iIndice = Number(sPathAnexo.split("/").pop());
            const aAnexos = oNovoChamado.getProperty("/anexos") ?? [];

            if (!(iIndice >= 0) || iIndice >= aAnexos.length) {
                return;
            }

            oNovoChamado.setProperty("/anexos",
                aAnexos.slice(0, iIndice).concat(aAnexos.slice(iIndice + 1)));

            MessageToast.show(this._getResourceBundle().getText("criarChamadoAnexoRemovido"));
        },

        // Peneira dos DOIS FileUploaders (wizard e detalhe): devolve so os arquivos aceitos e relata
        // os recusados por motivo. Aceitar arquivo por arquivo e o ponto - com fileType e
        // maximumFileSize no controle, o UI5 reprovava a selecao inteira no primeiro ofensor e ainda
        // engolia o change, entao os arquivos bons escolhidos junto sumiam sem aviso nenhum.
        _filtrarAnexosPermitidos(aFiles) {
            const oBundle = this._getResourceBundle();
            const aTipoInvalido = [];
            const aGrandes = [];

            const aAceitos = aFiles.filter((oFile) => {
                const sNome = String(oFile.name ?? "");
                const iPonto = sNome.lastIndexOf(".");
                const sExtensao = iPonto >= 0 ? sNome.slice(iPonto + 1).toLowerCase() : "";

                if (EXTENSOES_ANEXO.indexOf(sExtensao) < 0) {
                    aTipoInvalido.push(sNome);
                    return false;
                }

                if (Number(oFile.size) > MAX_BYTES_ANEXO) {
                    aGrandes.push(sNome);
                    return false;
                }

                return true;
            });

            // Um toast por MOTIVO, com os nomes: um por arquivo enfileiraria varios toasts em cima
            // do usuario numa selecao grande.
            if (aTipoInvalido.length) {
                MessageToast.show(oBundle.getText("criarChamadoAnexoTipoInvalido",
                    [aTipoInvalido.join(", ")]));
            }

            if (aGrandes.length) {
                MessageToast.show(oBundle.getText("criarChamadoAnexoTamanhoExcedido",
                    [aGrandes.join(", "), String(MAX_BYTES_ANEXO / (1024 * 1024))]));
            }

            return aAceitos;
        },

        _lerAnexoComoBase64(oFile) {
            // readAsDataURL ja entrega base64 pronto, basta cortar o cabecalho "data:<mime>;base64,".
            // A promise NUNCA rejeita (fica guardada ate o envio): base64 vazio sinaliza a falha.
            return new Promise((fnResolve) => {
                const oReader = new FileReader();

                oReader.onload = () => {
                    const sResultado = String(oReader.result ?? "");
                    const iVirgula = sResultado.indexOf(",");

                    // O CAP faz Buffer.from(valor, "base64") sem tirar prefixo: o data URL inteiro
                    // chegaria corrompido no C4C.
                    fnResolve(iVirgula >= 0 ? sResultado.slice(iVirgula + 1) : "");
                };

                oReader.onerror = () => {
                    Log.error(
                        "Falha ao ler o arquivo do anexo",
                        oReader.error,
                        "megawork.mwmonitorchamados.controller.Main"
                    );
                    fnResolve("");
                };

                oReader.readAsDataURL(oFile);
            });
        },

        _limparAnexosPendentes() {
            this.getView().getModel("novoChamado").setProperty("/anexos", []);
            this.byId("fileUploaderAnexo")?.setValue("");
        },

        _formatarTamanhoArquivo(iBytes) {
            // A aba Anexos imprime "tamanho" cru, entao o valor ja nasce como texto legivel.
            const iValor = Number(iBytes) || 0;

            if (iValor < 1024) {
                return iValor + " B";
            }
            if (iValor < 1024 * 1024) {
                return (iValor / 1024).toFixed(1).replace(".", ",") + " KB";
            }

            return (iValor / (1024 * 1024)).toFixed(1).replace(".", ",") + " MB";
        },

        // Ambiente/sistema afetado e O que pode ser afetado sao os dois MultiComboBox que o
        // cliente realmente marca; selectedKeys ja e TwoWay com novoChamado>/areasAfetadas e
        // .../tiposImpacto (atualizado pelo proprio controle antes do selectionChange disparar),
        // entao so falta recalcular a Prioridade - resultado da soma dos pesos marcados enquadrada
        // em FAIXAS_PRIORIDADE_POR_PONTUACAO, gravada no model e nunca exposta como campo proprio
        // na tela do cliente.
        onAreasImpactoChange() {
            this._recalcularPrioridadeChamado();
        },

        _recalcularPrioridadeChamado() {
            const oNovoChamado = this.getView().getModel("novoChamado");
            const oCodelists = this.getOwnerComponent().getModel("codelists");

            const iPontuacao = this._pontuacaoOpcoesMarcadas(
                oNovoChamado.getProperty("/areasAfetadas"),
                oCodelists.getProperty("/areasAfetadasChamado")
            ) + this._pontuacaoOpcoesMarcadas(
                oNovoChamado.getProperty("/tiposImpacto"),
                oCodelists.getProperty("/tiposImpactoChamado")
            );

            const oFaixa = FAIXAS_PRIORIDADE_POR_PONTUACAO.find((o) => iPontuacao >= o.min);

            oNovoChamado.setProperty("/prioridade", oFaixa ? oFaixa.prioridade : "BAIXA");
        },

        _pontuacaoOpcoesMarcadas(aCodesMarcados, aCodelist) {
            if (!Array.isArray(aCodesMarcados) || !Array.isArray(aCodelist)) {
                return 0;
            }

            return aCodesMarcados.reduce((iSoma, sCode) => {
                const oOpcao = aCodelist.find((o) => o.code === sCode);
                return iSoma + (oOpcao ? Number(oOpcao.peso) || 0 : 0);
            }, 0);
        },

        onDetalhesLiveChange(oEvent) {
            const oField = oEvent?.getSource?.();
            const sValue = oEvent?.getParameter?.("value") ?? "";

            if (oField && oField.getValueState() !== "None" && sValue.trim()) {
                oField.setValueState("None");
                oField.setValueStateText("");
            }

            this._sincronizarValidacaoWizard();
        },

        onWizardStepActivate(oEvent) {
            const iIndex = oEvent?.getParameter?.("index");

            if (iIndex) {
                this._setPassoWizard(iIndex);
            }
        },

        onWizardNavigationChange(oEvent) {
            const oWizard = this._getWizard();
            const oStep = oEvent?.getParameter?.("step");

            if (!oWizard || !oStep) {
                return;
            }

            const iIndex = oWizard.getSteps().indexOf(oStep) + 1;

            if (iIndex < 1) {
                return;
            }

            const iPendente = this._primeiroPassoPendente();

            if (iPendente && iIndex > iPendente) {
                const oPassoPendente = this._getPassoWizardControl(iPendente);

                if (oPassoPendente) {
                    oWizard.discardProgress(oPassoPendente);
                    oWizard.invalidateStep(oPassoPendente);
                    this._irParaPasso(iPendente);
                    MessageToast.show(this._getResourceBundle().getText(
                        iPendente === PASSO_CLASSIFICACAO ? "criarChamadoWizStep1Falta" : "criarChamadoWizStep2Falta"
                    ));
                    return;
                }
            }

            this._setPassoWizard(iIndex);
        },

        onWizardAvancar() {
            const oWizard = this._getWizard();
            if (!oWizard) {
                return;
            }

            const aSteps = oWizard.getSteps();
            const iPasso = this._getPassoWizard();

            if (iPasso >= aSteps.length) {
                return;
            }

            if (!this._isPassoValido(iPasso)) {
                this._sincronizarValidacaoWizard();
                return;
            }

            if (iPasso < oWizard.getProgress()) {
                oWizard.goToStep(aSteps[iPasso], false);
            } else {
                oWizard.nextStep();
            }

            this._setPassoWizard(iPasso + 1);
        },

        onWizardVoltar() {
            const oWizard = this._getWizard();
            const iPasso = this._getPassoWizard();

            if (!oWizard || iPasso <= 1) {
                return;
            }

            const oAlvo = oWizard.getSteps()[iPasso - 2];
            if (!oAlvo) {
                return;
            }

            oWizard.goToStep(oAlvo, false);
            this._setPassoWizard(iPasso - 1);
        },

        _finalizarChamado() {
            const oBundle = this._getResourceBundle();
            const oData = this.getView().getModel("novoChamado").getData();
            const oInputTitulo = this.byId("inputTituloChamado");
            const oTextAreaDescricao = this.byId("textAreaDescricaoChamado");

            oInputTitulo?.setValueState("None");
            oTextAreaDescricao?.setValueState("None");

            if (!oData.titulo || !oData.titulo.trim()) {
                const sErro = oBundle.getText("criarChamadoErroTitulo");

                oInputTitulo?.setValueState("Error");
                oInputTitulo?.setValueStateText(sErro);
                MessageToast.show(sErro);
                this._irParaPasso(PASSO_CLASSIFICACAO);
                return;
            }

            if (!oData.descricao || !oData.descricao.trim()) {
                const sErro = oBundle.getText("criarChamadoErroDescricao");

                oTextAreaDescricao?.setValueState("Error");
                oTextAreaDescricao?.setValueStateText(sErro);
                MessageToast.show(sErro);
                this._irParaPasso(PASSO_DETALHES);
                return;
            }

            const oBtnFinalizar = this.byId("btnWizardFinalizar");
            oBtnFinalizar?.setBusyIndicatorDelay(0);
            oBtnFinalizar?.setBusy(true);

            // Capturado antes da cadeia: _resetNovoChamado zera o modelo e o FileUploader.
            const aAnexos = this.getView().getModel("novoChamado").getProperty("/anexos") ?? [];
            // Toggle de e-mail pode trocar o requisitante durante o POST.
            const iGeracao = this._iGeracaoRequisitante;

            this._criarTicket(oData).then((oCriado) => {
                // Daqui para baixo o chamado JA existe no C4C e nao ha rollback: o envio dos anexos
                // nunca pode virar rejeicao, senao o catch anunciaria falha de criacao.
                return this._enviarAnexosDoChamado(aAnexos, oCriado)
                    .then((oEnvio) => ({ oCriado, oEnvio }));
            }).then(({ oCriado, oEnvio }) => {
                const sNewId = String(oCriado?.ID ?? "").trim();

                this._adicionarTicketNaLista(oData, oCriado);

                MessageToast.show(oBundle.getText("criarChamadoSucesso", [sNewId]));

                this._relatarEnvioDeAnexos(sNewId, aAnexos.length, oEnvio);

                this._resetNovoChamado();

                // O toast e a lista ja avisaram: navegar agora tiraria o usuario da Home a que o
                // toggle de e-mail o levou.
                if (iGeracao !== this._iGeracaoRequisitante) {
                    return;
                }

                this.byId("mainContents").to(this.createId("acompanharChamados"));
                this.byId("sideNavigation").setSelectedKey("acompanharChamados");
            }).catch((oError) => {
                Log.error("Falha ao criar o chamado no backend", oError, "megawork.mwmonitorchamados.controller.Main");
                MessageBox.error(oBundle.getText("criarChamadoErroCriar"));
            }).finally(() => {
                oBtnFinalizar?.setBusy(false);
            });
        },

        _criarTicket(oData) {
            const oModel = this.getOwnerComponent().getModel();

            const oPayload = {
                Name: oData.titulo.trim(),
                ProcessingTypeCode: PROCESSING_TYPE_CODE_C4C,
                ServicePriorityCode: PRIORIDADE_CHAMADO_PARA_C4C[oData.prioridade]
                    ?? PRIORIDADE_CHAMADO_PARA_C4C.NORMAL,
                ServiceRequestTextCollection: [{
                    TypeCode: TYPE_CODE_DESCRICAO_C4C,
                    Text: oData.descricao.trim()
                }]
            };

            if (oData.cliente) {
                oPayload.BuyerPartyID = oData.cliente;
            }

            if (this._sRequisitanteContatoId) {
                oPayload.BuyerMainContactPartyID = this._sRequisitanteContatoId;
            }

            if (oData.componenteSap?.id) {
                oPayload.Z_COMPONENT_SFM_KUT = oData.componenteSap.id;
            }

            const oListBinding = oModel.bindList("/ServiceRequests");
            const oContext = oListBinding.create(oPayload, true);

            return oContext.created()
                .then(() => oContext.getObject())
                .finally(() => oListBinding.destroy());
        },

        // Anexos do wizard, depois de o chamado existir (nao ha deep insert: o arquivo e escolhido
        // antes de haver ParentObjectID). Nunca rejeita, como _enviarAnexosAoChamado.
        _enviarAnexosDoChamado(aAnexos, oCriado) {
            if (!aAnexos.length) {
                return Promise.resolve({ iEnviados: 0, aFalharam: [] });
            }

            const sParentObjectID = String(oCriado?.ObjectID ?? "").trim();

            // Sem ObjectID nao ha a que anexar: o CAP rejeitaria o POST com 400.
            if (!sParentObjectID) {
                Log.error(
                    "Chamado criado sem ObjectID: os anexos nao podem ser enviados",
                    null,
                    "megawork.mwmonitorchamados.controller.Main"
                );

                return Promise.resolve({
                    iEnviados: 0,
                    aFalharam: aAnexos.map((oAnexo) => oAnexo.nome)
                });
            }

            return this._enviarAnexosAoChamado(sParentObjectID, aAnexos);
        },

        // Relato do envio SEMPRE em cima de um sucesso de criacao: silencio quando tudo subiu,
        // contagem e nomes quando nao. Nada de aviso generico - o usuario precisa saber o que
        // reenviar pelo chat.
        _relatarEnvioDeAnexos(sNewId, iTotal, oEnvio) {
            const oBundle = this._getResourceBundle();
            const iEnviados = oEnvio?.iEnviados ?? 0;
            const aFalharam = oEnvio?.aFalharam ?? [];

            if (!aFalharam.length) {
                return;
            }

            if (iEnviados) {
                MessageBox.warning(oBundle.getText("criarChamadoAvisoAnexosParcial",
                    [sNewId, String(iEnviados), String(iTotal), aFalharam.join(", ")]));
                return;
            }

            // Um arquivo so: a mensagem no singular que ja existia continua servindo.
            MessageBox.warning(iTotal === 1
                ? oBundle.getText("criarChamadoAvisoAnexo", [sNewId])
                : oBundle.getText("criarChamadoAvisoAnexosNenhum", [sNewId, String(iTotal)]));
        },

        _adicionarTicketNaLista(oData, oCriado) {
            const oTicketsModel = this.getView().getModel("tickets");
            const aTickets = oTicketsModel.getProperty("/Tickets") ?? [];

            aTickets.unshift({
                ID: String(oCriado?.ID ?? "").trim(),
                objectID: oCriado?.ObjectID ?? "",
                titulo: oData.titulo.trim(),
                // O create acabou de mandar SRRQ, entao o code vale mesmo se a resposta nao o trouxer.
                tipo: this._tipoTexto(oCriado?.ProcessingTypeCode ?? PROCESSING_TYPE_CODE_C4C,
                    oCriado?.ProcessingTypeCodeText),
                prioridade: oCriado?.ServicePriorityCode
                    ?? PRIORIDADE_CHAMADO_PARA_C4C[oData.prioridade]
                    ?? PRIORIDADE_CHAMADO_PARA_C4C.NORMAL,
                prioridadeTexto: oCriado?.ServicePriorityCodeText ?? "",
                status: oCriado?.ServiceRequestUserLifeCycleStatusCode ?? "",
                statusTexto: oCriado?.ServiceRequestUserLifeCycleStatusCodeText ?? "",
                situacao: oCriado?.ServiceRequestLifeCycleStatusCode ?? "",
                situacaoTexto: oCriado?.ServiceRequestLifeCycleStatusCodeText ?? "",
                responsavelId: oCriado?.ProcessorPartyName ?? "",
                // Semeado do proprio payload: sem ele o dialogo SAP do chamado recem-criado nao
                // resolveria o cliente e a ajuda de ambientes ficaria travada ate um refresh.
                buyerPartyId: String(oCriado?.BuyerPartyID ?? oData.cliente ?? "").trim(),
                // Mesmo valor que o create mandou em BuyerMainContactPartyID: sem ele o dialogo SAP
                // do chamado recem-criado nao teria por onde resolver o S-User do requisitante.
                buyerMainContactPartyId: String(this._sRequisitanteContatoId ?? "").trim(),
                // Nome junto porque e o fallback do sUserNome: sem ele um contato da ALM sem
                // firstname mostraria "nao encontrado" ao lado do S-User preenchido.
                buyerMainContactPartyName: String(this._sRequisitanteNome ?? "").trim(),
                // Mesmo valor que o create mandou em Z_COMPONENT_SFM_KUT: sem ele o dialogo SAP do
                // chamado recem-criado abriria sem o componente que ja esta gravado no header.
                componenteSapId: String(oCriado?.Z_COMPONENT_SFM_KUT ?? oData.componenteSap?.id ?? "").trim(),
                // Mesma forma das linhas vindas do C4C; _enriquecerClientesSap preenche abaixo.
                customerNbr: "",
                customerNome: "",
                dataAbertura: this._paraIsoLocal(oCriado?.CreationDateTime) || this._agoraIso(),
                resolvidoEm: "",
                descricao: oData.descricao.trim(),
                historico: [],
                chat: [],
                // Sem semear os arquivos que acabaram de subir: o ObjectID do anexo nao e confiavel
                // na resposta do create, e sem ele a linha nao seria baixavel. A primeira abertura
                // do detalhe le a verdade do C4C. Efeito aceito: o tamanho dos arquivos do wizard
                // nao aparece depois, porque o C4C nao guarda tamanho.
                anexos: [],
                anexosCarregado: false
            });
            oTicketsModel.setProperty("/Tickets", aTickets);

            this._montarListasDeFiltro(aTickets);

            // Sem await: quem acabou de criar o chamado nao espera pelo numero do cliente.
            this._enriquecerClientesSap([aTickets[0]]);
        },

        _resetNovoChamado() {
            // Object.assign copia a REFERENCIA dos arrays do default: sem os arrays novos aqui,
            // dois chamados seguidos compartilhariam a mesma lista de pendentes/marcacoes.
            this.getView().getModel("novoChamado").setData(
                Object.assign({}, NOVO_CHAMADO_DEFAULTS, { anexos: [], areasAfetadas: [], tiposImpacto: [] }));

            this.byId("inputTituloChamado")?.setValueState("None");
            this.byId("textAreaDescricaoChamado")?.setValueState("None");

            this._limparAnexosPendentes();

            this._aplicarRequisitante();

            this._resetWizard();
        },

        // E-mail do usuario logado via UserInfo do shell (Work Zone). Resolve null quando o app
        // roda fora do launchpad ou o servico falha - nunca rejeita.
        _lerUsuarioLogado() {
            // TESTE: usando email fixo temporariamente
            return Promise.resolve(this._sEmailDev || EMAIL_LOCAL_DEV);

            // PROVISORIO: com o botao ligado o shell e ignorado e o app se apresenta ao backend
            // como EMAIL_LOCAL_DEV. Ver onAlternarEmailLocal.
            // if (this._bEmailLocal) {
            //     Log.warning("E-mail local ligado: usando " + EMAIL_LOCAL_DEV + " no lugar do usuario do shell",
            //         undefined, "megawork.mwmonitorchamados.controller.Main");
            //     return Promise.resolve(EMAIL_LOCAL_DEV);
            // }

            // if (typeof sap === "undefined" || !sap.ushell?.Container) {
            //     // App rodando fora do Fiori Launchpad, sap.ushell nao existe.
            //     Log.warning("Shell do launchpad indisponivel; o backend resolve o usuario pelo JWT",
            //         undefined, "megawork.mwmonitorchamados.controller.Main");
            //     return Promise.resolve(null);
            // }

            // return sap.ushell.Container.getServiceAsync("UserInfo")
            //     .then((oUserInfoService) => oUserInfoService.getUser().getEmail() || null)
            //     .catch((oError) => {
            //         Log.error("Falha ao ler o usuario logado no shell", oError,
            //             "megawork.mwmonitorchamados.controller.Main");
            //         return null;
            //     });
        },

        _carregarRequisitante() {
            const oComponent = this.getOwnerComponent();
            const oCodelists = oComponent.getModel("codelists");
            const oOperation = oComponent.getModel().bindContext("/Requisitante(...)");
            // Toggle de e-mail dev troca o usuario em runtime: o S-User cacheado e do anterior.
            const iGeracao = (this._iGeracaoRequisitante ?? 0) + 1;
            let sEmailRequisitante = null;

            this._iGeracaoRequisitante = iGeracao;
            this._pSUserRequisitante = null;

            // O e-mail vem do UserInfo do shell; sem shell vai null e o backend resolve pelo JWT
            // (app-service.js) - caminho que o frontend nao consegue adulterar.
            return this._lerUsuarioLogado().then((sEmail) => {
                sEmailRequisitante = sEmail;

                if (sEmail) {
                    oOperation.setParameter("email", sEmail);
                }

                return Promise.all([
                    oOperation.invoke().then(() => oOperation.getBoundContext().requestObject()),
                    oCodelists.dataLoaded()
                ]);
            }).then((aResultados) => {
                const oRequisitante = aResultados[0] ?? {};
                const aClientes = oRequisitante.clientes ?? [];

                this._sRequisitanteNome = oRequisitante.nome ?? "";
                this._sRequisitanteContatoId = oRequisitante.contatoId ?? "";
                // Guardada no controller (mesmo padrao de _sRequisitanteNome/_sRequisitanteContatoId)
                // porque e ela que diz se a ausencia de empresas e esperada ou e motivo de bloqueio.
                this._sRequisitanteOrigem = oRequisitante.origem ?? "";

                // Funcionario interno aparece como executor do atendimento, nao como requisitante.
                this._sCampoEscopoChamado =
                    this._sRequisitanteOrigem === ORIGEM_REQUISITANTE_FUNCIONARIO
                        ? CAMPO_ESCOPO_EXECUTOR
                        : CAMPO_ESCOPO_REQUISITANTE;

                this.getView().getModel("view").setProperty("/requisitanteEhFuncionario",
                    this._sRequisitanteOrigem === ORIGEM_REQUISITANTE_FUNCIONARIO);

                // So o executor abre chamado SAP: adianta a consulta cara do S-User aqui para o
                // dialogo so exibir. Sem await - a promise cacheada nunca rejeita.
                if (this._sRequisitanteOrigem === ORIGEM_REQUISITANTE_FUNCIONARIO) {
                    this._prefetchSUserRequisitante(sEmailRequisitante, iGeracao);
                }

                oCodelists.setProperty("/clientes", aClientes);
                this._aplicarRequisitante();

                // origem vazia = nem contato nem funcionario responderam pelo e-mail; sem contatoId
                // o filtro de escopo nao existe e a lista sairia com TODOS os chamados do tenant.
                // Nos dois casos bloqueia aqui: o false devolvido e o que impede
                // _carregarTickets/_carregarCockpit de rodarem.
                if (!this._sRequisitanteOrigem || !this._sRequisitanteContatoId) {
                    MessageBox.error(this._getResourceBundle().getText("requisitanteSemEmpresa"));
                    return false;
                }

                // Funcionario interno (fallback pela EmployeeCollection): sem AccountID na
                // collection, clientes vem SEMPRE vazio - exigir empresa aqui bloquearia um usuario
                // com contatoId valido. Fica so no log: nao ha acao a tomar e o app segue utilizavel.
                if (this._sRequisitanteOrigem === ORIGEM_REQUISITANTE_FUNCIONARIO) {
                    Log.warning("Requisitante identificado como funcionario interno pela EmployeeCollection: "
                        + "sem empresas vinculadas, o seletor de empresa do wizard fica vazio e o chamado "
                        + "criado sai sem BuyerPartyID", null,
                        "megawork.mwmonitorchamados.controller.Main");

                    // Libera o busy da pagina "criarChamado": ele NAO pode depender de /clientes,
                    // que neste caminho fica vazio para sempre - o wizard ficaria girando justamente
                    // para o usuario que o fallback veio destravar.
                    oCodelists.setProperty("/requisitanteCarregado", true);

                    return true;
                }

                // Caminho do contato: sem nenhuma empresa vinculada o wizard de criacao nao tem o
                // que oferecer no seletor de empresa - mantido bloqueado como antes.
                if (!aClientes.length) {
                    MessageBox.error(this._getResourceBundle().getText("requisitanteSemEmpresa"));
                    return false;
                }

                oCodelists.setProperty("/requisitanteCarregado", true);

                return true;
            }).catch((oError) => {
                Log.error("Falha ao carregar o requisitante", oError, "megawork.mwmonitorchamados.controller.Main");

                MessageBox.error(this._getResourceBundle().getText("requisitanteErroCarregar"));

                return false;
            });
        },

        // Refresh e toggle de e-mail podem filtrar antes de _carregarRequisitante definir o escopo.
        _getCampoEscopoChamado() {
            return this._sCampoEscopoChamado || CAMPO_ESCOPO_REQUISITANTE;
        },

        _aplicarRequisitante() {
            const oNovoChamado = this.getView()?.getModel("novoChamado");
            if (!oNovoChamado) {
                return;
            }

            if (this._sRequisitanteNome) {
                oNovoChamado.setProperty("/contato", this._sRequisitanteNome);
            }

            const aClientes = this.getOwnerComponent().getModel("codelists")?.getProperty("/clientes") ?? [];

            if (oNovoChamado.getProperty("/cliente") || !aClientes.length) {
                return;
            }

            oNovoChamado.setProperty("/cliente", aClientes[0].code);
        },

        _resetWizard() {
            const oWizard = this._getWizard();

            if (!oWizard) {
                this._setPassoWizard(PASSO_CLASSIFICACAO);
                return;
            }

            const oPrimeiroPasso = oWizard.getSteps()[0];

            if (oPrimeiroPasso) {
                oWizard.discardProgress(oPrimeiroPasso);
                [PASSO_CLASSIFICACAO, PASSO_DETALHES].forEach((iPasso) => {
                    const oPasso = this._getPassoWizardControl(iPasso);
                    if (oPasso) {
                        oWizard.invalidateStep(oPasso);
                    }
                });
                oWizard.goToStep(oPrimeiroPasso, false);
            }

            this._setPassoWizard(PASSO_CLASSIFICACAO);
        },

        _sincronizarValidacaoWizard() {
            const oWizard = this._getWizard();

            if (oWizard) {
                [PASSO_CLASSIFICACAO, PASSO_DETALHES].forEach((iPasso) => {
                    const oPasso = this._getPassoWizardControl(iPasso);

                    if (!oPasso) {
                        return;
                    }

                    if (this._isPassoValido(iPasso)) {
                        oWizard.validateStep(oPasso);
                    } else {
                        oWizard.invalidateStep(oPasso);
                    }
                });
            }

            this._atualizarNavegacaoWizard();
        },

        _isPassoValido(iPasso) {
            const oData = this.getView().getModel("novoChamado")?.getData() ?? {};

            if (iPasso === PASSO_CLASSIFICACAO) {
                return !!(oData.titulo && oData.titulo.trim());
            }

            if (iPasso === PASSO_DETALHES) {
                return !!(oData.descricao && oData.descricao.trim());
            }

            return true;
        },

        _primeiroPassoPendente() {
            if (!this._isPassoValido(PASSO_CLASSIFICACAO)) {
                return PASSO_CLASSIFICACAO;
            }

            if (!this._isPassoValido(PASSO_DETALHES)) {
                return PASSO_DETALHES;
            }

            return 0;
        },

        _irParaPasso(iPasso) {
            const oWizard = this._getWizard();
            if (!oWizard) {
                return;
            }

            const aSteps = oWizard.getSteps();

            if (!(iPasso >= 1) || iPasso > aSteps.length) {
                return;
            }

            const oAlvo = aSteps[iPasso - 1];
            if (!oAlvo) {
                return;
            }

            if (iPasso <= oWizard.getProgress()) {
                oWizard.goToStep(oAlvo, true);
            } else {
                const iPendente = this._primeiroPassoPendente();

                if (iPendente && iPasso > iPendente) {
                    this._irParaPasso(iPendente);
                    return;
                }

                oWizard.setCurrentStep(oAlvo);
            }

            this._setPassoWizard(iPasso);
        },

        _setPassoWizard(iPasso) {
            this.getView().getModel("view")?.setProperty("/passoWizard", iPasso);
            this._atualizarNavegacaoWizard();
        },

        _getPassoWizard() {
            return this.getView().getModel("view")?.getProperty("/passoWizard") || PASSO_CLASSIFICACAO;
        },

        _atualizarNavegacaoWizard() {
            const oViewModel = this.getView().getModel("view");
            if (!oViewModel) {
                return;
            }

            const iPasso = oViewModel.getProperty("/passoWizard") || PASSO_CLASSIFICACAO;
            const iTotal = this._getTotalPassosWizard();

            oViewModel.setProperty("/podeVoltar", iPasso > 1);
            oViewModel.setProperty("/podeAvancar", iPasso < iTotal && this._isPassoValido(iPasso));
        },

        _getWizard() {
            return this.byId(WIZARD_ID);
        },

        _getTotalPassosWizard() {
            return this._getWizard()?.getSteps().length || TOTAL_PASSOS_WIZARD;
        },

        _getPassoWizardControl(iPasso) {
            const oWizard = this._getWizard();
            if (!oWizard) {
                return undefined;
            }

            const aSteps = oWizard.getSteps();
            const oPorId = this.byId(IDS_PASSOS_WIZARD[iPasso - 1]);

            return (oPorId && aSteps.indexOf(oPorId) >= 0) ? oPorId : aSteps[iPasso - 1];
        },

        _applyTicketFilters(sSufixo) {
            const oBinding = this.byId("ticketsTable" + (sSufixo ?? "")).getBinding("items");
            if (!oBinding) {
                return;
            }

            const aActiveFilters = Object.values(this._filtrosDaTela(sSufixo)).filter(Boolean);

            oBinding.filter(aActiveFilters.length
                ? new Filter({ filters: aActiveFilters, and: true })
                : []);
        },

        // local ISO string ("yyyy-MM-ddTHH:mm:ss") comparable with dataAbertura;
        // bEndOfDay pins the time to 23:59:59
        _toComparableIso(oDate, bEndOfDay) {
            const fnPad = (iValue) => String(iValue).padStart(2, "0");
            const sDate = oDate.getFullYear() + "-" + fnPad(oDate.getMonth() + 1) + "-" + fnPad(oDate.getDate());

            return sDate + (bEndOfDay ? "T23:59:59" : "T00:00:00");
        },

        _getResourceBundle() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        async _carregarCockpit() {
            // Sem contato real (falha no /Requisitante) nao ha escopo por requisitante:
            // renderiza vazio em vez de contar o tenant inteiro.
            if (!this._sRequisitanteContatoId) {
                this._renderizarCockpit([]);

                // Sem escopo nao houve carga: o botao atualizar nao deve dizer que deu certo.
                return false;
            }

            // Toggle de e-mail dev pode trocar o requisitante enquanto esta carga viaja.
            const iGeracao = this._iGeracaoRequisitante;

            try {
                const aChamados = await this._buscarChamadosCockpit();

                // Repintar aqui poria os recentes do requisitante anterior nos cards da Home.
                if (iGeracao !== this._iGeracaoRequisitante) {
                    return false;
                }

                this._renderizarCockpit(aChamados);

                return true;
            } catch (oError) {
                Log.error("Falha ao carregar o cockpit a partir do C4C", oError,
                    "megawork.mwmonitorchamados.controller.Main");

                // Falha de carga obsoleta: o toast e o clear apagariam o cockpit do requisitante novo.
                if (iGeracao !== this._iGeracaoRequisitante) {
                    return false;
                }

                MessageToast.show("Falha ao carregar os chamados do cockpit");
                this._renderizarCockpit([]);

                return false;
            }
        },

        // Le os chamados do requisitante em UMA unica requisicao: os cards e a lista de recentes
        // saem todos desse array, agregados no cliente (ver _renderizarCockpit). O desenho antigo
        // (uma contagem $count por card) nao serve - o C4C rejeita $count e derruba o batch.
        _buscarChamadosCockpit() {
            const oModel = this.getOwnerComponent().getModel();

            // Mesmo escopo da aba "Acompanhar Chamados" (_carregarTickets), senao os cards
            // contariam o tenant inteiro. Quem garante que existe contato real aqui e a guarda
            // no inicio de _carregarCockpit.
            const aFiltros = [
                new Filter(this._getCampoEscopoChamado(), FilterOperator.EQ, this._sRequisitanteContatoId)
            ];

            const oBinding = oModel.bindList(
                "/ServiceRequests",
                undefined,
                undefined,
                aFiltros,
                {
                    $select: "ID,Name,ServiceRequestUserLifeCycleStatusCode,ServiceRequestUserLifeCycleStatusCodeText,"
                        + "ServicePriorityCode,ServicePriorityCodeText,ProcessorPartyID,LastChangeDateTime",
                    // $direct: fora do $batch padrao ($auto), que tambem carrega _carregarTickets().
                    // Se aquela chamada falhar, ela derruba o batch inteiro e corrompe as respostas
                    // vizinhas (mesmo bug documentado no onInit para _carregarRequisitante).
                    $$groupId: "$direct"
                }
            );

            return oBinding.requestContexts(0, LIMITE_CONTAGEM_COCKPIT)
                .then((aContexts) => aContexts.map((oContext) => oContext.getObject()))
                .finally(() => oBinding.destroy());
        },

        _renderizarCockpit(aChamados) {
            const aAbertos = aChamados.filter((o) =>
                COCKPIT_STATUS_ABERTO.includes(o.ServiceRequestUserLifeCycleStatusCode));
            const iAndamento = aChamados.filter((o) =>
                COCKPIT_STATUS_EM_ANDAMENTO.includes(o.ServiceRequestUserLifeCycleStatusCode)).length;
            const iFechado = aChamados.filter((o) =>
                COCKPIT_STATUS_FECHADO.includes(o.ServiceRequestUserLifeCycleStatusCode)).length;
            const iUrgente = aChamados.filter((o) =>
                COCKPIT_PRIORIDADES_URGENTES.includes(o.ServicePriorityCode)).length;
            const iSemResponsavel = aAbertos.filter((o) => !o.ProcessorPartyID).length;

            this.byId("cockpitTotalNumber")?.setNumber(aChamados.length);
            this.byId("cockpitOpenNumber")?.setNumber(aAbertos.length);
            this.byId("cockpitInProgressNumber")?.setNumber(iAndamento);
            this.byId("cockpitDoneNumber")?.setNumber(iFechado);
            this.byId("cockpitTotalStatus")?.setText(`${iUrgente} imediatos ou urgentes`);
            this.byId("cockpitOpenStatus")?.setText(`${iSemResponsavel} aguardando atribuição`);

            // A lista de recentes e declarativa (items="{view>/cockpitRecentes}") e cada item
            // NAVEGA para a pagina de detalhe (CustomListItem type "Active" +
            // press=".onCockpitTicketPress"). Por isso o campo "id" vai no item: o handler precisa
            // reencontrar a linha em tickets>/Tickets, que e o modelo do detalhe. So o ID viaja -
            // o ObjectID nem vem no $select do cockpit e e resolvido depois, pela linha de tickets.
            const aRecentes = aAbertos
                .slice()
                .sort((oA, oB) => this._paraIsoLocal(oB.LastChangeDateTime)
                    .localeCompare(this._paraIsoLocal(oA.LastChangeDateTime)))
                .slice(0, MAX_CHAMADOS_RECENTES)
                .map((oChamado) => ({
                    intro: `#${oChamado.ID}`,
                    titulo: oChamado.Name,
                    atributoTexto: (COCKPIT_PRIORIDADE_TEXTO[oChamado.ServicePriorityCode]
                        ?? oChamado.ServicePriorityCodeText ?? "")
                        + " · atualizado em " + this._formatarDataHoraCockpit(oChamado.LastChangeDateTime),
                    // Campo de navegacao, nao exibido pelo XML (ver onCockpitTicketPress).
                    id: String(oChamado.ID ?? "")
                }));

            // Defensivo como as linhas dos KPIs acima: isso roda depois de um await, e a view pode
            // ter sido destruida enquanto a requisicao estava em voo (usuario sai do app no FLP).
            this.getView()?.getModel("view")?.setProperty("/cockpitRecentes", aRecentes);
        },

        _formatarDataHoraCockpit(vData) {
            const sIso = this._paraIsoLocal(vData);

            return sIso ? oCockpitDateTimeFormat.format(new Date(sIso)) : "";
        },

        // ---- Chats ----
        // Todo o estado mora no model "view" (/chatLista, /chatSelecionado, /chatMensagens),
        // declarado no onInit. "Chats" e 100% local (mock); so o lado Sap fala com OData, e a
        // bifurcacao e um unico if em _selecionarChat.
        // Duas telas com o MESMO codigo: "Chats" (sufixo "") e "Chat com SAP" (sufixo "Sap"). O
        // sufixo entra tanto nos ids dos controles quanto no nome das propriedades do modelo, entao
        // cada tela tem lista, conversa selecionada e mensagens proprias. onChatAcoes nao tem
        // variante *Sap (toast sem estado); onChatInformacoes so e usado pela tela Chats.

        onChatSelect(oEvent) {
            this._selecionarChat(oEvent, "");
        },

        onChatSelectSap(oEvent) {
            this._selecionarChat(oEvent, "Sap");
        },

        _selecionarChat(oEvent, sSufixo) {
            const oItem = oEvent.getParameter("listItem");
            if (!oItem) {
                return;
            }

            const oContext = oItem.getBindingContext("view");
            if (!oContext) {
                return;
            }

            const oChat = oContext.getObject();
            const oModel = this.getView().getModel("view");

            oModel.setProperty("/chatSelecionado" + sSufixo, oChat);

            // Zera as nao lidas pelo PATH do contexto: a lista pode estar filtrada pelo
            // SearchField, entao o indice visual nao corresponde ao indice do array.
            oModel.setProperty(oContext.getPath() + "/naoLidas", 0);

            // Bifurcacao das duas telas: "Chats" segue 100% em memoria (o ciclo do chatCarregando
            // abre e fecha no mesmo tick e nada aparece), enquanto "Chat com SAP" le os comentarios
            // do caso na ALM e e quem realmente usa o busy da List.
            if (sSufixo === "Sap") {
                this._carregarComentariosDoCasoSap(oContext.getPath());

                return;
            }

            oModel.setProperty("/chatCarregando", true);
            oModel.setProperty("/chatMensagens", oChat.mensagens ?? []);
            oModel.setProperty("/chatCarregando", false);

            this.byId("chatsMensagensScroll")?.scrollTo(0, 99999, 0);
        },

        // Conversa do caso SAP: 1 GET por clique, com cache na propria linha. Recebe o PATH do item
        // (e nao o objeto) porque a resposta chega depois e a linha pode ter se movido - o path e
        // reresolvido por ID no retorno, como em _carregarChatDoTicket.
        _carregarComentariosDoCasoSap(sPathChat) {
            const oModel = this.getView().getModel("view");
            const oChat = oModel.getProperty(sPathChat) ?? {};
            const sId = String(oChat.id ?? "");
            const sCorrelationId = String(oChat.correlationId ?? "").trim();

            // Contador de geracao, nao comparacao de path: trocar de caso rapido deixaria a resposta
            // do caso anterior pintar a conversa do novo (mesmo motivo de _iGeracaoCasosChamadoSap).
            // Incrementa ANTES do teste de cache: a selecao servida da memoria tambem tem de
            // invalidar a leitura em voo, senao a resposta do caso lento repinta as bolhas do caso
            // cacheado que o usuario acabou de abrir - com o cabecalho ainda mostrando o outro.
            this._iGeracaoComentariosCasoSap = (this._iGeracaoComentariosCasoSap || 0) + 1;
            const iGeracao = this._iGeracaoComentariosCasoSap;

            // Ja lido: serve do cache da linha, que inclui o que o usuario digitou no FeedInput.
            if (oChat.comentariosCarregados) {
                // Solta o busy aqui porque o finally da leitura em voo ja esta fora da geracao
                // corrente e nao vai mais solta-lo - a conversa ficaria sob o indicador ate o GET
                // do outro caso terminar.
                oModel.setProperty("/chatCarregandoSap", false);
                oModel.setProperty("/chatMensagensSap", oChat.mensagens ?? []);
                this.byId("chatsMensagensScrollSap")?.scrollTo(0, 99999, 0);

                return Promise.resolve(false);
            }

            // Limpa antes de carregar: senao as bolhas do caso anterior ficam sob o busy.
            oModel.setProperty("/chatMensagensSap", []);

            if (!sCorrelationId) {
                // Mesmo motivo do ramo de cache: a geracao ja subiu e o finally da leitura em voo
                // nao solta mais o busy, que ficaria ligado para sempre nesta coluna.
                oModel.setProperty("/chatCarregandoSap", false);
                MessageToast.show(this._getResourceBundle()
                    .getText("chatsSapCasoSemCorrelationId"));

                return Promise.resolve(false);
            }

            oModel.setProperty("/chatCarregandoSap", true);

            // Promise memoizada e ja quente (o onInit a consumiu em _carregarChamadosSap): pedir o
            // S-User de novo nao gera round-trip. Nunca rejeita.
            return this._lerSUserRequisitante()
                .then((oResultado) => {
                    const sSUser = String(oResultado?.sUser ?? "").trim();

                    // Sem S-User a ALM responderia fora de escopo; na pratica nem ha lista, que vem
                    // da mesma carga que exige o S-User.
                    if (!sSUser) {
                        Log.warning("Comentarios do caso " + sCorrelationId
                            + " ignorados: requisitante sem S-User", null,
                            "megawork.mwmonitorchamados.controller.Main");

                        return null;
                    }

                    return this._bolhasDoCasoSap(sCorrelationId, sSUser);
                })
                .then((aMensagens) => {
                    // Clique em outro caso enquanto esta leitura viajava.
                    if (iGeracao !== this._iGeracaoComentariosCasoSap || !aMensagens) {
                        return false;
                    }

                    const sPathAtual = this._pathDoChatPorId(sId, "Sap");

                    if (!sPathAtual) {
                        return false;
                    }

                    // Mescla, nao substitui: mensagem digitada no FeedInput durante a leitura (sem
                    // origemAlm) seria apagada por um setProperty seco.
                    const aLocais = (oModel.getProperty(sPathAtual + "/mensagens") ?? [])
                        .filter((oMensagem) => !oMensagem.origemAlm);
                    const aTudo = aMensagens.concat(aLocais);

                    oModel.setProperty(sPathAtual + "/mensagens", aTudo);
                    oModel.setProperty(sPathAtual + "/comentariosCarregados", true);
                    oModel.setProperty("/chatMensagensSap", aTudo);

                    // O scrollTo sincrono de _selecionarChat rolaria a conversa ANTERIOR: o
                    // setProperty so agenda o render. O timeout 0 cai depois da tarefa de rendering
                    // do UI5, com as bolhas novas ja no DOM.
                    window.setTimeout(
                        () => this.byId("chatsMensagensScrollSap")?.scrollTo(0, 99999, 0), 0);

                    return true;
                })
                .catch((oError) => {
                    Log.error("Falha ao carregar os comentarios do caso SAP " + sCorrelationId,
                        oError, "megawork.mwmonitorchamados.controller.Main");

                    // O toast so sai se o caso que falhou for o que esta aberto na tela.
                    if (iGeracao === this._iGeracaoComentariosCasoSap) {
                        MessageToast.show(this._getResourceBundle()
                            .getText("chatsSapErroCarregarComentarios"));
                    }

                    return false;
                })
                .finally(() => {
                    // Soltar o busy fora da geracao corrente apagaria o indicador da leitura nova.
                    if (iGeracao === this._iGeracaoComentariosCasoSap) {
                        oModel.setProperty("/chatCarregandoSap", false);
                    }
                });
        },

        // Sem cache (1 GET por abertura, como os campos) e com a guarda de _lerDetalheCasoSap: o
        // contador _iGeracaoComentariosCasoSap e da lista de conversas, mexer nele mataria a de la.
        _carregarComentariosDoDetalheSap(sCorrelationId, sSUser) {
            const oModelo = this._modeloCasoSap();

            // Defensivo: onTicketPressSap ja barra o caso sem correlationId antes de abrir a tela.
            if (!sCorrelationId) {
                Log.warning("Comentarios do detalhe SAP ignorados: caso sem correlationId", null,
                    "megawork.mwmonitorchamados.controller.Main");

                return Promise.resolve(false);
            }

            oModelo.setProperty("/chatCarregando", true);

            return this._bolhasDoCasoSap(sCorrelationId, sSUser)
                .then((aBolhas) => {
                    // Resposta lenta de um caso abandonado pintaria a conversa do caso aberto agora.
                    if (oModelo.getProperty("/correlationId") !== sCorrelationId) {
                        return false;
                    }

                    // Sem payload nao e conversa vazia: calar aqui deixaria a conversa anterior na
                    // tela depois do refresh, com o toast de sucesso por cima.
                    if (!aBolhas) {
                        oModelo.setProperty("/chat", []);
                        oModelo.setProperty("/chatFalha", true);

                        return false;
                    }

                    oModelo.setProperty("/chat", aBolhas);
                    oModelo.setProperty("/chatFalha", false);

                    // O setProperty so agenda o render: o scroll sincrono rolaria a conversa anterior.
                    window.setTimeout(
                        () => this.byId("detalheChatScrollSap")?.scrollTo(0, 99999, 0), 0);

                    return true;
                })
                .catch((oError) => {
                    Log.error("Falha ao carregar os comentarios do caso SAP " + sCorrelationId,
                        oError, "megawork.mwmonitorchamados.controller.Main");

                    if (oModelo.getProperty("/correlationId") !== sCorrelationId) {
                        return false;
                    }

                    // Sem toast: a MessageStrip do cartao ja avisa e _lerDetalheCasoSap costuma
                    // toastar junto (mesma origem) - dois toasts empilhados so atrapalham.
                    oModelo.setProperty("/chat", []);
                    oModelo.setProperty("/chatFalha", true);

                    return false;
                })
                .finally(() => {
                    // Resposta obsoleta soltaria o busy da leitura do caso novo, ainda em voo.
                    if (oModelo.getProperty("/correlationId") === sCorrelationId) {
                        oModelo.setProperty("/chatCarregando", false);
                    }
                });
        },

        // Envio do detalhe SAP: le tudo do modelo casoSap porque este fragment nao tem bindElement
        // em tickets - onDetalheEnviarMensagem, que parte do getBindingContext, nao serve aqui.
        onDetalheSapEnviarMensagem(oEvent) {
            const sTexto = (oEvent.getParameter("value") || "").trim();

            if (!sTexto) {
                return;
            }

            const oModelo = this._modeloCasoSap();
            const sCorrelationId = String(oModelo.getProperty("/correlationId") ?? "").trim();
            const oBundle = this._getResourceBundle();

            // Toast, e nao so return: o FeedInput ja limpou o campo e o usuario ficaria sem sinal.
            if (!sCorrelationId) {
                MessageToast.show(oBundle.getText("chatsSapCasoSemCorrelationId"));

                return;
            }

            // Rede de seguranca: o enabled do FeedInput ja barra o segundo clique e o envio durante
            // a leitura - uma leitura iniciada ANTES do POST volta com um payload sem a mensagem
            // nova e o setProperty("/chat") seco dela apagaria a bolha ja confirmada.
            if (oModelo.getProperty("/chatEnviando") === true
                || oModelo.getProperty("/chatCarregando") === true) {
                return;
            }

            // Sem origemAlm de proposito: essa marca so entra na bolha ja confirmada pela ALM, senao
            // uma releitura concorrente apagaria a mensagem ainda em voo. Quem casa a bolha na volta
            // (troca ou remocao) e o id, nao a ausencia da marca.
            const oOtimista = {
                id: "m" + Date.now(),
                autor: AUTOR_MENSAGEM_PROPRIA,
                texto: sTexto,
                quando: this._agoraIso(),
                eu: true
            };

            // Array novo: push in place nao reavalia o binding da List da conversa.
            oModelo.setProperty("/chat", (oModelo.getProperty("/chat") ?? []).concat([oOtimista]));
            oModelo.setProperty("/chatEnviando", true);

            // O setProperty so agenda o render: o scroll sincrono rolaria a conversa anterior.
            window.setTimeout(() => this.byId("detalheChatScrollSap")?.scrollTo(0, 99999, 0), 0);

            // S-User lido no momento do envio, nunca cacheado em campo do controller: o toggle de
            // e-mail dev troca o requisitante. A promise e memoizada, entao nao ha round-trip extra.
            this._lerSUserRequisitante()
                .then((oResultado) => {
                    const sSUser = String(oResultado?.sUser ?? "").trim();

                    // Voltou e abriu outro caso: mexer no modelo agora pintaria o caso errado.
                    if (oModelo.getProperty("/correlationId") !== sCorrelationId) {
                        return null;
                    }

                    if (!sSUser) {
                        Log.warning("Comentario do caso " + sCorrelationId
                            + " nao enviado: requisitante sem S-User", null,
                            "megawork.mwmonitorchamados.controller.Main");

                        this._removerBolhaDoDetalheSap(oModelo, oOtimista.id);
                        MessageToast.show(oBundle.getText("chatsSapComentarioSemSUser"));

                        return null;
                    }

                    return this._enviarComentarioCasoSap(sCorrelationId, sSUser, sTexto);
                })
                .then((oResposta) => {
                    if (!oResposta || oModelo.getProperty("/correlationId") !== sCorrelationId) {
                        return;
                    }

                    // Le /chat de novo: um refresh pode ter trocado o array inteiro. O indice
                    // "e"+timestamp nao colide com os ids <correlationId>c<i> da releitura.
                    const aChat = oModelo.getProperty("/chat") ?? [];
                    const iIndice = aChat.findIndex((oMensagem) => oMensagem.id === oOtimista.id);

                    if (iIndice < 0) {
                        return;
                    }

                    const aNovo = aChat.slice();

                    aNovo[iIndice] = this._mapearComentarioSapParaChat(oResposta.comentario,
                        sCorrelationId, "e" + Date.now());
                    oModelo.setProperty("/chat", aNovo);
                })
                .catch((oError) => {
                    Log.error("Falha ao enviar o comentario ao caso SAP " + sCorrelationId, oError,
                        "megawork.mwmonitorchamados.controller.Main");

                    if (oModelo.getProperty("/correlationId") !== sCorrelationId) {
                        return;
                    }

                    // Rollback, ao contrario do caminho C4C: manter a bolha desenharia uma mensagem
                    // que a SAP nunca recebeu, e a proxima releitura a apagaria em silencio. Reenvio
                    // so manual - o CommentPost nao tem chave de deduplicacao e a mensagem pode ter
                    // sido gravada mesmo com erro na volta.
                    this._removerBolhaDoDetalheSap(oModelo, oOtimista.id);
                    MessageToast.show(this._mensagemDeFalhaAoComentarSap(oError));
                    this.byId("detalheChatFeedInputSap")?.setValue(sTexto);
                })
                .finally(() => {
                    // Soltar a trava fora do caso corrente liberaria o campo do caso aberto agora.
                    if (oModelo.getProperty("/correlationId") === sCorrelationId) {
                        oModelo.setProperty("/chatEnviando", false);
                    }
                });
        },

        // Mesma leitura de _falhaAoAbrirCasoSap, e usada pelas duas telas de chat SAP: so 400/428
        // provam que a ALM recusou ANTES de gravar, e ai o motivo dela e a unica pista acionavel
        // ("passa de 5000 caracteres", "caso encerrado") - engolir isso deixa o usuario reenviando o
        // mesmo texto em loop. Timeout e 5xx podem ter gravado, entao seguem com o texto que pede
        // conferencia antes do reenvio: o POST nao tem chave de deduplicacao.
        _mensagemDeFalhaAoComentarSap(oError) {
            const oBundle = this._getResourceBundle();
            const iStatus = Number(oError?.status ?? 0);

            if (iStatus !== 400 && iStatus !== 428) {
                return oBundle.getText("chatsSapEnviarComentarioErro");
            }

            const sManchete = oBundle.getText("chatsSapComentarioRecusado");
            const sDetalhe = String(oError?.message ?? "").trim();

            return sDetalhe ? sManchete + "\n\n" + sDetalhe : sManchete;
        },

        // Array novo pelo mesmo motivo do concat do envio: mutar em lugar nao reavalia o binding.
        _removerBolhaDoDetalheSap(oModelo, sIdBolha) {
            oModelo.setProperty("/chat", (oModelo.getProperty("/chat") ?? [])
                .filter((oMensagem) => oMensagem.id !== sIdBolha));
        },

        // Conversa da ALM sem estado de tela: quem chama e dono do busy, do cache e do erro.
        _bolhasDoCasoSap(sCorrelationId, sSUser) {
            return this._lerComentariosCasoSap(sCorrelationId, sSUser)
                .then((oComentarios) => {
                    // null, e nao []: sem payload o chamador nao tem o que pintar, e isso nao e o
                    // mesmo que uma conversa vazia.
                    if (!oComentarios) {
                        return null;
                    }

                    // Truncamento e fato do backend (limit 200): sem o aviso a tela afirma
                    // silenciosamente que o caso tem menos comentario do que tem.
                    if (oComentarios.truncado === true) {
                        Log.warning("Caso " + sCorrelationId + ": " + oComentarios.total
                            + " comentarios na ALM, a conversa mostra " + oComentarios.exibidos,
                            null, "megawork.mwmonitorchamados.controller.Main");
                    }

                    return (oComentarios.comentarios ?? [])
                        .map((oComentario, iIndice) =>
                            this._mapearComentarioSapParaChat(oComentario, sCorrelationId, iIndice))
                        // Sem sorter nas Lists e sem ordem garantida pelo endpoint; data ilegivel
                        // vira "" e subiria ao topo, entao cai no fim na ordem que a ALM mandou.
                        .sort((oA, oB) => (oA.quando ? 0 : 1) - (oB.quando ? 0 : 1)
                            || oA.quando.localeCompare(oB.quando));
                });
        },

        // $direct como as outras leituras SAP: o detalhe dispara esta function no MESMO tick de
        // DetalheCasoSap, e sem isso a conversa entraria no $batch do C4C em vez de ir sozinha.
        _lerComentariosCasoSap(sCorrelationId, sSUser) {
            const oOperation = this.getOwnerComponent().getModel()
                .bindContext("/ComentariosCasoSap(...)", null, { $$groupId: "$direct" });

            oOperation.setParameter("correlationId", sCorrelationId);
            oOperation.setParameter("sUser", sSUser);

            return oOperation.invoke()
                .then(() => oOperation.getBoundContext().requestObject())
                .finally(() => oOperation.destroy());
        },

        // Envia UMA mensagem ao caso e devolve o comentario ja no formato do GET. Sem estado de
        // tela: quem chama e dono do busy, da bolha e do erro (mesmo contrato de _bolhasDoCasoSap).
        // $direct como as outras chamadas SAP: sem isso a escrita entraria no $batch do C4C.
        _enviarComentarioCasoSap(sCorrelationId, sSUser, sTexto) {
            const oOperation = this.getOwnerComponent().getModel()
                .bindContext("/EnviarComentarioCasoSap(...)", null, { $$groupId: "$direct" });

            oOperation.setParameter("correlationId", sCorrelationId);
            oOperation.setParameter("sUser", sSUser);
            oOperation.setParameter("texto", sTexto);

            return oOperation.invoke()
                .then(() => oOperation.getBoundContext().requestObject())
                .finally(() => oOperation.destroy());
        },

        // origemAlm marca a bolha vinda do backend: e por essa marca que a releitura sabe o que pode
        // substituir e o que e local do FeedInput (espelha o origemC4C do detalhe).
        _mapearComentarioSapParaChat(oComentario, sCorrelationId, iIndice) {
            const sBruto = String(oComentario.quando ?? "").trim();

            // A ALM manda "2021-06-01 12:00:00" em UTC: sem o T o parse fica por conta de extensao
            // do engine e sem o Z o new Date leria como hora local, jogando a bolha 3 h no futuro em
            // UTC-3. Fora desse formato o valor vai cru, e _paraIsoLocal - o unico produtor de data
            // do modelo - devolve "" no que new Date nao entende.
            const sQuando = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(sBruto)
                ? sBruto.replace(" ", "T") + "Z"
                : sBruto;

            return {
                id: sCorrelationId + "c" + iIndice,
                // A ALM so devolve o S-User do autor; nome de pessoa nao existe neste endpoint.
                autor: String(oComentario.autor ?? "").trim()
                    || this._getResourceBundle().getText("chatsSapAutorDesconhecido"),
                texto: String(oComentario.texto ?? "").trim(),
                quando: this._paraIsoLocal(sQuando),
                // Direcao pelo type, nunca por createdBy: o colega da mesma empresa comenta com
                // OUTRO S-User, e cruzar com o S-User da tela mandaria a mensagem dele para a
                // esquerda com o avatar de cliente, como se a SAP tivesse escrito. Vazio ou
                // desconhecido cai em false: dizer que a SAP escreveu erra menos do que assinar
                // no nosso nome.
                eu: String(oComentario.tipo ?? "").trim() === TIPO_COMENTARIO_CLIENTE_SAP,
                origemAlm: true
            };
        },

        // Atende os eventos search e liveChange do mesmo SearchField: um deles traz "query",
        // o outro "newValue".
        onChatSearch(oEvent) {
            this._buscarChats(oEvent, "");
        },

        onChatSearchSap(oEvent) {
            this._buscarChats(oEvent, "Sap");
        },

        _buscarChats(oEvent, sSufixo) {
            const sBusca = (oEvent.getParameter("query") ?? oEvent.getParameter("newValue") ?? "").trim();
            const oBinding = this.byId("chatsList" + sSufixo)?.getBinding("items");

            if (!oBinding) {
                return;
            }

            if (!sBusca) {
                oBinding.filter([]);
                return;
            }

            oBinding.filter([new Filter({
                filters: [
                    new Filter("nome", FilterOperator.Contains, sBusca),
                    new Filter("departamento", FilterOperator.Contains, sBusca),
                    new Filter("ultimaMensagem", FilterOperator.Contains, sBusca)
                ],
                and: false
            })]);
        },

        // Handler do post do FeedInput da barra de envio, igual ao onDetalheEnviarMensagem: o
        // texto vem no parametro "value" do evento, e nao de um campo lido por ID - o FeedInput
        // limpa o proprio value depois de postar, e so a falha do POST na ALM repoe o texto la.
        onChatEnviarMensagem(oEvent) {
            this._enviarMensagemDoChat(oEvent, "");
        },

        onChatEnviarMensagemSap(oEvent) {
            this._enviarMensagemDoChat(oEvent, "Sap");
        },

        _enviarMensagemDoChat(oEvent, sSufixo) {
            const sTexto = (oEvent.getParameter("value") || "").trim();

            if (!sTexto) {
                return;
            }

            const oModel = this.getView().getModel("view");
            const oChat = oModel.getProperty("/chatSelecionado" + sSufixo);

            if (!oChat) {
                return;
            }

            // Mesma bifurcacao de _selecionarChat: so a conversa SAP fala com a ALM, o chat ""
            // continua 100% em memoria.
            if (sSufixo === "Sap") {
                this._enviarComentarioDoChatSap(oChat, sTexto);

                return;
            }

            this._anexarMensagemNoChat(sSufixo, oChat, {
                id: "m" + Date.now(),
                autor: AUTOR_MENSAGEM_PROPRIA,
                texto: sTexto,
                quando: this._agoraIso(),
                eu: true
            });
        },

        // Extraido porque o caminho SAP precisa do mesmo anexo ANTES do POST (bolha otimista).
        _anexarMensagemNoChat(sSufixo, oChat, oMensagem) {
            const oModel = this.getView().getModel("view");
            // Array novo: push in place nao reavalia o binding da List de mensagens.
            const aMensagens = (oModel.getProperty("/chatMensagens" + sSufixo) ?? [])
                .concat([oMensagem]);

            oModel.setProperty("/chatMensagens" + sSufixo, aMensagens);

            // Reflete na linha da lista da esquerda (previa + horario) pelo path resolvido por ID.
            const sPath = this._pathDoChatPorId(oChat.id, sSufixo);

            if (sPath) {
                oModel.setProperty(sPath + "/mensagens", aMensagens);
                oModel.setProperty(sPath + "/ultimaMensagem", oMensagem.texto);
                oModel.setProperty(sPath + "/dataHora", oMensagem.quando);
            }

            // O setProperty so agenda o render: o scroll sincrono rolaria com a altura ANTERIOR e
            // deixaria a bolha recem-anexada fora da area visivel. Mesmo timeout 0 do detalhe SAP.
            window.setTimeout(
                () => this.byId("chatsMensagensScroll" + sSufixo)?.scrollTo(0, 99999, 0), 0);
        },

        // Envio da conversa SAP: mesmo contrato de _carregarComentariosDoCasoSap - este metodo e o
        // dono do busy, da bolha e do erro.
        _enviarComentarioDoChatSap(oChat, sTexto) {
            const oModel = this.getView().getModel("view");
            const oBundle = this._getResourceBundle();
            const sCorrelationId = String(oChat.correlationId ?? "").trim();

            // Antes de pintar a bolha: pintada e removida em seguida, ela piscaria sem motivo.
            if (!sCorrelationId) {
                MessageToast.show(oBundle.getText("chatsSapCasoSemCorrelationId"));

                return;
            }

            // Rede de seguranca: o enabled do FeedInput ja barra o segundo clique e o envio durante
            // a leitura - uma leitura iniciada ANTES do POST volta sem a mensagem nova, e a mescla
            // de _carregarComentariosDoCasoSap descartaria a bolha ja confirmada (tem origemAlm) ou
            // duplicaria a otimista se a ALM tivesse indexado o comentario a tempo.
            if (oModel.getProperty("/chatEnviandoSap") === true
                || oModel.getProperty("/chatCarregandoSap") === true) {
                return;
            }

            // Sem origemAlm de proposito: a mescla de _carregarComentariosDoCasoSap so preserva as
            // bolhas sem essa marca, e uma releitura concorrente apagaria a mensagem ainda em voo.
            // Quem casa a bolha na volta (troca ou remocao) e o id.
            const oOtimista = {
                id: "m" + Date.now(),
                autor: AUTOR_MENSAGEM_PROPRIA,
                texto: sTexto,
                quando: this._agoraIso(),
                eu: true
            };

            // Previa guardada antes do eco otimista: ela nasce com o assunto do caso, e recalcula-la
            // no rollback deixaria a linha em branco num caso ainda sem comentario.
            const sPathLinha = this._pathDoChatPorId(oChat.id, "Sap");
            const oPreviaAnterior = sPathLinha ? {
                texto: oModel.getProperty(sPathLinha + "/ultimaMensagem") ?? "",
                quando: oModel.getProperty(sPathLinha + "/dataHora") ?? ""
            } : null;

            this._anexarMensagemNoChat("Sap", oChat, oOtimista);
            oModel.setProperty("/chatEnviandoSap", true);

            // Mesma promise memoizada e ja quente da leitura da conversa: nao gera round-trip e
            // nunca rejeita.
            this._lerSUserRequisitante()
                .then((oResultado) => {
                    const sSUser = String(oResultado?.sUser ?? "").trim();

                    // Sem S-User a ALM recusaria o POST (reporter e required no envio).
                    if (!sSUser) {
                        Log.warning("Comentario do caso " + sCorrelationId
                            + " nao enviado: requisitante sem S-User", null,
                            "megawork.mwmonitorchamados.controller.Main");

                        this._substituirMensagemNoChatSap(oChat, oOtimista.id, null,
                            oPreviaAnterior);
                        MessageToast.show(oBundle.getText("chatsSapComentarioSemSUser"));

                        return null;
                    }

                    return this._enviarComentarioCasoSap(sCorrelationId, sSUser, sTexto);
                })
                .then((oResposta) => {
                    if (!oResposta) {
                        return;
                    }

                    // O indice "e"+timestamp nao colide com os ids <correlationId>c<i> que a
                    // releitura gera; a bolha nova ja nasce com origemAlm, entao a proxima leitura
                    // a substitui em vez de duplicar.
                    this._substituirMensagemNoChatSap(oChat, oOtimista.id,
                        this._mapearComentarioSapParaChat(oResposta.comentario, sCorrelationId,
                            "e" + Date.now()));
                })
                .catch((oError) => {
                    Log.error("Falha ao enviar o comentario ao caso SAP " + sCorrelationId, oError,
                        "megawork.mwmonitorchamados.controller.Main");

                    // Rollback, ao contrario do caminho C4C: manter a bolha desenharia uma mensagem
                    // que a SAP nunca recebeu, e a releitura a apagaria em silencio depois. Reenvio
                    // so manual - o POST nao tem chave de deduplicacao e a mensagem pode ter sido
                    // gravada mesmo com erro na volta. Roda fora da guarda de conversa: casa por
                    // path re-resolvido, entao acerta a linha mesmo com outro caso aberto.
                    this._substituirMensagemNoChatSap(oChat, oOtimista.id, null, oPreviaAnterior);

                    // Ja dentro da guarda: o FeedInput e UNICO na tela. Repor o texto do caso A no
                    // campo de outra conversa faria o proximo clique em enviar gravar a mensagem no
                    // caso errado - escrita real e sem volta, a ALM nao apaga comentario.
                    if (oModel.getProperty("/chatSelecionadoSap")?.id !== oChat.id) {
                        return;
                    }

                    MessageToast.show(this._mensagemDeFalhaAoComentarSap(oError));

                    // Seguro aqui: este callback e assincrono, ja depois do setValue("") interno
                    // que o FeedInput faz ao postar.
                    this.byId("chatsFeedInputSap")?.setValue(sTexto);
                })
                .finally(() => {
                    oModel.setProperty("/chatEnviandoSap", false);
                });
        },

        // oNova null remove a bolha (rollback). Casa por ID, e nao por texto como
        // _substituirMensagemLocalPorC4C: duas mensagens iguais em sequencia trocariam a errada.
        _substituirMensagemNoChatSap(oChat, sIdLocal, oNova, oPreviaAnterior) {
            const oModel = this.getView().getModel("view");
            // Path re-resolvido na volta: a lista pode ter sido filtrada ou reordenada durante o POST.
            const sPath = this._pathDoChatPorId(oChat.id, "Sap");

            if (!sPath) {
                return;
            }

            // Cache da linha e a fonte de verdade: e ele que a proxima selecao serve.
            const aMensagens = (oModel.getProperty(sPath + "/mensagens") ?? []).slice();
            const iIndice = aMensagens.findIndex((oMensagem) => oMensagem.id === sIdLocal);

            if (iIndice < 0) {
                return;
            }

            if (oNova) {
                aMensagens[iIndice] = oNova;
            } else {
                aMensagens.splice(iIndice, 1);

                // Repoe a previa de antes do envio, e nao a ultima bolha restante: sem comentario
                // nenhum a segunda linha da lista e o assunto do caso, que o recalculo apagaria.
                const oUltima = aMensagens[aMensagens.length - 1];

                oModel.setProperty(sPath + "/ultimaMensagem",
                    oPreviaAnterior?.texto ?? oUltima?.texto ?? "");
                oModel.setProperty(sPath + "/dataHora",
                    oPreviaAnterior?.quando ?? oUltima?.quando ?? "");
            }

            oModel.setProperty(sPath + "/mensagens", aMensagens);

            // A coluna visivel so muda se a conversa aberta ainda for esta: trocar de caso durante o
            // POST e escrever aqui pintaria bolha no caso errado.
            if (oModel.getProperty("/chatSelecionadoSap")?.id === oChat.id) {
                oModel.setProperty("/chatMensagensSap", aMensagens);
            }
        },

        onChatAcoes() {
            MessageToast.show(this._getResourceBundle().getText("chatsAcaoIndisponivel"));
        },

        onChatInformacoes() {
            MessageToast.show(this._getResourceBundle().getText("chatsAcaoIndisponivel"));
        },

        // Espelha _pathDoChamadoPorId: a lista pode estar filtrada ou reordenada, entao gravar
        // num indice fixo escreveria na linha de outro chat.
        _pathDoChatPorId(sId, sSufixo) {
            if (!sId) {
                return null;
            }

            const sLista = "/chatLista" + (sSufixo ?? "");
            const aChats = this.getView().getModel("view").getProperty(sLista) ?? [];
            const iIndice = aChats.findIndex((oChat) => oChat.id === sId);

            return iIndice < 0 ? null : sLista + "/" + iIndice;
        },

        // Devolve um ARRAY NOVO a cada chamada (literal montado aqui dentro, sem constante de
        // modulo compartilhada): uma constante seria a MESMA referencia em toda recarga do
        // modelo, e as escritas do chat vazariam entre elas - mesma pegadinha de
        // NOVO_CHAMADO_DEFAULTS/_resetNovoChamado.
        // Forma do chat:     { id, nome, departamento, ultimaMensagem, dataHora, naoLidas, mensagens }
        // Forma da mensagem: { id, autor, texto, quando, eu } - os mesmos nomes do chat do
        // DetalheChamado, para o markup e formatter.dataAbertura serem identicos.
        // So a tela "Chats" usa este mock: a lista de "Chat com SAP" vem dos casos reais
        // (_espelharCasosSapNoChat), com os MESMOS nomes de campo desta forma.
        _criarChatsMock() {
            return [{
                id: "c1",
                nome: "Suporte N1",
                departamento: "Infraestrutura",
                ultimaMensagem: "Consegue tentar acessar de novo e confirmar?",
                dataHora: "2026-08-12T09:41:00",
                naoLidas: 2,
                mensagens: [{
                    id: "c1m1",
                    autor: "Suporte N1",
                    texto: "Bom dia! Recebemos o alerta de indisponibilidade do servidor de arquivos.",
                    quando: "2026-08-12T08:52:00",
                    eu: false
                }, {
                    id: "c1m2",
                    autor: AUTOR_MENSAGEM_PROPRIA,
                    texto: "Bom dia. Aqui na filial ninguem consegue abrir a pasta compartilhada desde ontem à noite.",
                    quando: "2026-08-12T09:03:00",
                    eu: true
                }, {
                    id: "c1m3",
                    autor: "Suporte N1",
                    texto: "Obrigado pelo retorno. Identificamos que o serviço de compartilhamento caiu durante a "
                        + "janela de manutenção da madrugada e o reinício automático falhou por falta de espaço em "
                        + "disco no volume de logs. Já liberamos espaço, subimos o serviço novamente e estamos "
                        + "monitorando o consumo pelas próximas horas para garantir que não volte a acontecer.",
                    quando: "2026-08-12T09:28:00",
                    eu: false
                }, {
                    id: "c1m4",
                    autor: "Suporte N1",
                    texto: "Consegue tentar acessar de novo e confirmar?",
                    quando: "2026-08-12T09:41:00",
                    eu: false
                }]
            }, {
                id: "c2",
                nome: "Financeiro",
                departamento: "Contas a pagar",
                ultimaMensagem: "A nota fiscal entrou na programação desta sexta.",
                dataHora: "2026-08-12T08:15:00",
                naoLidas: 1,
                mensagens: [{
                    id: "c2m1",
                    autor: AUTOR_MENSAGEM_PROPRIA,
                    texto: "Oi, consegue verificar o status do pagamento do fornecedor Delta?",
                    quando: "2026-08-11T16:40:00",
                    eu: true
                }, {
                    id: "c2m2",
                    autor: "Financeiro",
                    texto: "Verifico sim. O documento está em aprovação com a gerência.",
                    quando: "2026-08-11T17:05:00",
                    eu: false
                }, {
                    id: "c2m3",
                    autor: "Financeiro",
                    texto: "A nota fiscal entrou na programação desta sexta.",
                    quando: "2026-08-12T08:15:00",
                    eu: false
                }]
            }, {
                id: "c3",
                nome: "Ana Paula Souza",
                departamento: "Recursos Humanos",
                ultimaMensagem: "Perfeito, obrigado pelo envio!",
                dataHora: "2026-08-11T17:52:00",
                naoLidas: 0,
                mensagens: [{
                    id: "c3m1",
                    autor: "Ana Paula Souza",
                    texto: "Boa tarde! Preciso do comprovante de horas do mês passado.",
                    quando: "2026-08-11T15:12:00",
                    eu: false
                }, {
                    id: "c3m2",
                    autor: AUTOR_MENSAGEM_PROPRIA,
                    texto: "Boa tarde, Ana. Acabei de anexar o relatório no chamado 8801.",
                    quando: "2026-08-11T17:30:00",
                    eu: true
                }, {
                    id: "c3m3",
                    autor: "Ana Paula Souza",
                    texto: "Perfeito, obrigado pelo envio!",
                    quando: "2026-08-11T17:52:00",
                    eu: false
                }]
            }, {
                id: "c4",
                nome: "Time de Integrações",
                departamento: "TI",
                ultimaMensagem: "Vamos reprocessar a fila hoje à noite.",
                dataHora: "2026-08-11T14:30:00",
                naoLidas: 0,
                mensagens: [{
                    id: "c4m1",
                    autor: AUTOR_MENSAGEM_PROPRIA,
                    texto: "Pessoal, a integração de pedidos parou de gravar por volta das 11h.",
                    quando: "2026-08-11T11:48:00",
                    eu: true
                }, {
                    id: "c4m2",
                    autor: "Time de Integrações",
                    texto: "Confirmado. O certificado do middleware venceu e derrubou a autenticação.",
                    quando: "2026-08-11T12:22:00",
                    eu: false
                }, {
                    id: "c4m3",
                    autor: AUTOR_MENSAGEM_PROPRIA,
                    texto: "Tem previsão para normalizar?",
                    quando: "2026-08-11T13:10:00",
                    eu: true
                }, {
                    id: "c4m4",
                    autor: "Time de Integrações",
                    texto: "Vamos reprocessar a fila hoje à noite.",
                    quando: "2026-08-11T14:30:00",
                    eu: false
                }]
            }, {
                id: "c5",
                nome: "Central de Atendimento",
                departamento: "Qualidade",
                ultimaMensagem: "Pesquisa de satisfação respondida, obrigado.",
                dataHora: "2026-08-10T16:05:00",
                naoLidas: 0,
                mensagens: [{
                    id: "c5m1",
                    autor: "Central de Atendimento",
                    texto: "Olá! Poderia avaliar o atendimento do chamado 8790?",
                    quando: "2026-08-10T14:20:00",
                    eu: false
                }, {
                    id: "c5m2",
                    autor: AUTOR_MENSAGEM_PROPRIA,
                    texto: "Pesquisa de satisfação respondida, obrigado.",
                    quando: "2026-08-10T16:05:00",
                    eu: true
                }]
            }];
        }
    });
});
