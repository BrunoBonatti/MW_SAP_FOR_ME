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

    // PROVISORIO (homologacao): e-mail assumido no lugar do usuario do shell quando o botao
    // "e-mail local" do ToolHeader esta ligado. Trocar o valor aqui para testar como outro
    // requisitante. Sai junto com o botao quando o app for para producao.
    const EMAIL_LOCAL_DEV = "edislaine.silva@megawork.com";

    const NOVO_CHAMADO_DEFAULTS = {
        cliente: "",
        contato: "",
        titulo: "",
        prioridade: "NORMAL",
        descricao: "",
        anexos: []
    };

    const WIZARD_ID = "wizardCriarChamado";
    const PASSO_CLASSIFICACAO = 1;
    const PASSO_DETALHES = 2;
    const TOTAL_PASSOS_WIZARD = 4;
    const IDS_PASSOS_WIZARD = ["stepClassificacao", "stepDetalhes", "stepAnexo", "stepRevisao"];


    // Cockpit (Home). Escopo por requisitante (BuyerMainContactPartyID), igual a aba
    // "Acompanhar Chamados" - ver o filtro em _buscarChamadosCockpit.
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
        + "ProcessorPartyName,BuyerPartyName,BuyerMainContactPartyName,RequestFinisheddatetimeContent,"
        + "CreationDateTime,ResolvedOnDateTime,BuyerMainContactPartyID";

    const oCockpitDateTimeFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

    return Controller.extend("megawork.mwmonitorchamados.controller.Main", {

        _bExpanded: true,

        _bSortDescending: false,

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
                cockpitRecentes: []
            }), "view");

            // O array de anexos vem novo: Object.assign copia a REFERENCIA do array do default
            // (ver _resetNovoChamado, mesma pegadinha).
            this.getView().setModel(
                new JSONModel(Object.assign({}, NOVO_CHAMADO_DEFAULTS, { anexos: [] })), "novoChamado");

            this._mTicketFilters = {
                search: null,
                status: null,
                prioridade: null,
                data: null
            };

            if (this.byId("toolPage") && Device.resize.width <= 1024) {
                this.onSideNavButtonPress();
            }

            Device.media.attachHandler(this._handleWindowResize, this);

            this.getOwnerComponent().getModel("tickets").setProperty("/Tickets", []);

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
        onAlternarEmailLocal(oEvent) {
            const oBotao = oEvent.getSource();
            const bLigado = oBotao.getPressed();

            this._bEmailLocal = bLigado;

            // A lista inteira e recriada: o detalhe aberto esta preso a um indice ("/Tickets/3")
            // que passaria a apontar para outro chamado.
            this.byId("mainContents").to(this.createId("acompanharChamados"));

            oBotao.setEnabled(false);

            // _carregarRequisitante trata o proprio erro (nunca rejeita), entao a cadeia segue e
            // o botao sempre volta a ficar clicavel. Quando ele devolve false ja mostrou o popup
            // de bloqueio - seguir daria a mesma busca sem filtro que a guarda do onInit evita.
            this._carregarRequisitante()
                .then((bRequisitanteOk) => {
                    if (!bRequisitanteOk) {
                        return null;
                    }

                    return Promise.all([this._carregarTickets(), this._carregarCockpit()])
                        .then(() => {
                            MessageToast.show(bLigado
                                ? this._getResourceBundle().getText("emailLocalLigado", [EMAIL_LOCAL_DEV])
                                : this._getResourceBundle().getText("emailLocalDesligado"));
                        });
                })
                .finally(() => {
                    oBotao.setEnabled(true);
                });
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

        onSearchTickets(oEvent) {
            const sQuery = oEvent.getParameter("query") ?? oEvent.getParameter("newValue") ?? "";

            if (sQuery) {
                this._mTicketFilters.search = new Filter({
                    filters: [
                        new Filter("titulo", FilterOperator.Contains, sQuery),
                        new Filter("ID", FilterOperator.Contains, sQuery),
                        new Filter("tipo", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                });
            } else {
                this._mTicketFilters.search = null;
            }

            this._applyTicketFilters();
        },

        onFilterTickets() {
            const sStatus = this.byId("selectStatus").getSelectedKey();
            const sPrioridade = this.byId("selectPrioridade").getSelectedKey();

            this._mTicketFilters.status = sStatus
                ? new Filter("status", FilterOperator.EQ, sStatus)
                : null;
            this._mTicketFilters.prioridade = sPrioridade
                ? new Filter("prioridade", FilterOperator.EQ, sPrioridade)
                : null;

            this._applyTicketFilters();
        },

        onFilterDataAbertura() {
            const oDRS = this.byId("drsDataAbertura");
            const oFrom = oDRS.getDateValue();
            const oTo = oDRS.getSecondDateValue();

            if (oFrom && oTo) {
                this._mTicketFilters.data = new Filter(
                    "dataAbertura",
                    FilterOperator.BT,
                    this._toComparableIso(oFrom, false),
                    this._toComparableIso(oTo, true)
                );
            } else {
                this._mTicketFilters.data = null;
            }

            this._applyTicketFilters();
        },

        onSortTickets() {
            this._bSortDescending = !this._bSortDescending;

            const oBinding = this.byId("ticketsTable").getBinding("items");
            if (oBinding) {
                oBinding.sort(new Sorter("dataAbertura", this._bSortDescending));
            }
        },

        onRefreshTickets() {
            this.byId("searchTickets")?.setValue("");
            this.byId("selectStatus")?.setSelectedKey("");
            this.byId("selectPrioridade")?.setSelectedKey("");

            const oDRS = this.byId("drsDataAbertura");
            if (oDRS) {
                oDRS.setDateValue(null);
                oDRS.setSecondDateValue(null);
            }

            Object.keys(this._mTicketFilters).forEach((sKey) => {
                this._mTicketFilters[sKey] = null;
            });
            this._applyTicketFilters();

            this._carregarTickets().then((bOk) => {
                if (bOk) {
                    MessageToast.show(this._getResourceBundle().getText("ticketsRefreshTooltip"));
                }
            });
        },

        onTicketPress(oEvent) {
            const oContext = oEvent.getSource().getBindingContext("tickets");

            if (!oContext) {
                return;
            }

            this._abrirDetalheDoChamado(oContext);
        },

        // Recebe um Context DO MODELO "tickets" (nao um path solto): _carregarChatDoTicket e
        // _lerMudancasDoC4C leem oContext.getModel()/getPath() e gravam flags na propria linha.
        _abrirDetalheDoChamado(oContext) {
            const oViewModel = this.getView().getModel("view");

            if (!oContext) {
                return;
            }

            this.byId("detalheChamado").bindElement({
                path: oContext.getPath(),
                model: "tickets"
            });

            oViewModel.setProperty("/detalheAba", "descricao");
            oViewModel.setProperty("/detalheEdicao", false);
            oViewModel.setProperty("/detalheHeaderExpandido", true);

            this.byId("mainContents").to(this.createId("detalheChamado"));

            // O menu lateral acompanha a tela: o breadcrumb do detalhe (onDetalheVoltar) sempre
            // volta para "Acompanhar Chamados", entao entrar pelo cockpit sem mexer no selectedKey
            // deixaria "Home" marcado sobre a lista de chamados. Vindo da propria tabela, isso ja
            // esta correto e o set e inofensivo.
            this.byId("sideNavigation")?.setSelectedKey("acompanharChamados");

            // Depois do .to(): a tela abre na hora e chat/historico/anexos chegam quando a rede
            // responder.
            this._carregarChatDoTicket(oContext);
            this._lerMudancasDoC4C(oContext);
            this._carregarAnexosDoTicket(oContext);
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

            // O cockpit ordena por LastChangeDateTime e a aba por CreationDateTime (cortando em
            // MAX_TICKETS_LISTA): um chamado antigo com atualizacao recente pode estar na lista de
            // recentes sem estar em /Tickets. Recarregar a lista inteira NAO resolveria (mesma
            // query, mesmo corte) e ainda descartaria os caches de chat/historico das outras
            // linhas, entao busca-se o chamado pelo ID e insere-se so ele na lista.
            this._carregarChamadoPorId(oTicketsModel, sId).then((sPathNovo) => {
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
                aTickets.unshift(this._normalizarTickets([this._mapearServiceRequest(oChamado)])[0]);
                oTicketsModel.setProperty("/Tickets", aTickets);
                this._montarListasDeFiltro(aTickets);

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

                // A descricao NAO vem daqui: quem a preenche e _carregarChatDoTicket, a partir da
                // nota 10004. Gravar a string vazia que _mapearServiceRequest devolve apagaria o
                // texto que ja esta na tela.
                delete oCamposAtualizados.descricao;

                Object.keys(oCamposAtualizados).forEach((sCampo) => {
                    oTicketsModel.setProperty(sPathAtual + "/" + sCampo, oCamposAtualizados[sCampo]);
                });

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
            const oTable = this.byId("ticketsTable");

            oTable?.setBusyIndicatorDelay(0);
            oTable?.setBusy(true);

            const aFiltros = [];
            if (this._sRequisitanteContatoId) {
                aFiltros.push(new Filter("BuyerMainContactPartyID", FilterOperator.EQ, this._sRequisitanteContatoId));
            }

            const oBinding = oModel.bindList("/ServiceRequests", undefined,
                [new Sorter("CreationDateTime", true)],
                aFiltros.length ? aFiltros : undefined,
                { $select: SELECT_CHAMADO_LISTA });

            return oBinding.requestContexts(0, MAX_TICKETS_LISTA).then((aContexts) => {
                const aLinhas = aContexts.map((oContext) => this._mapearServiceRequest(oContext.getObject()));

                this._normalizarTickets(aLinhas);

                this._montarListasDeFiltro(aLinhas);
                oTicketsModel.setProperty("/Tickets", aLinhas);

                return true;
            }).catch((oError) => {
                Log.error("Falha ao carregar os chamados do backend", oError,
                    "megawork.mwmonitorchamados.controller.Main");

                MessageToast.show(this._getResourceBundle().getText("ticketsErroCarregar"));

                return false;
            }).finally(() => {
                oTable?.setBusy(false);
                oBinding.destroy();
            });
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
                buyerMainContactPartyName: oServiceRequest.BuyerMainContactPartyName ?? "",
                requestFinisheddatetimeContent: oServiceRequest.RequestFinisheddatetimeContent ?? "",
                dataAbertura: this._paraIsoLocal(oServiceRequest.CreationDateTime),
                resolvidoEm: this._paraIsoLocal(oServiceRequest.ResolvedOnDateTime),
                descricao: ""
            };
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
            this.byId("mainContents").to(this.createId("acompanharChamados"));
        },

        // Botao de refresh do header do detalhe: releitura de TUDO que o detalhe cacheia por linha
        // (campos core, chat, historico e anexos), em paralelo, com busy no proprio botao.
        onDetalheAtualizar() {
            const oButton = this.byId("detalheRefreshButton");
            const oContext = this.byId("detalheChamado").getBindingContext("tickets");

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
            const oContext = this.byId("detalheChamado")?.getBindingContext("tickets");

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
            const oContext = this.byId("detalheChamado").getBindingContext("tickets");

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

            const oContext = this.byId("detalheChamado")?.getBindingContext("tickets");

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
            const oContext = this.byId("detalheChamado").getBindingContext("tickets");

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
            const oContext = this.byId("detalheChamado").getBindingContext("tickets");

            if (!oContext) {
                return;
            }

            this._atualizarStatusChamado(oContext, "5", "Finalizado");
        },

        onDetalheCancelarChamado() {
            const oContext = this.byId("detalheChamado").getBindingContext("tickets");

            if (!oContext) {
                return;
            }

            this._atualizarStatusChamado(oContext, "6", "Cancelado");
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
        },

        _resetNovoChamado() {
            // Object.assign copia a REFERENCIA do array de anexos do default: sem o array novo aqui,
            // dois chamados seguidos compartilhariam a mesma lista de pendentes.
            this.getView().getModel("novoChamado").setData(
                Object.assign({}, NOVO_CHAMADO_DEFAULTS, { anexos: [] }));

            this.byId("inputTituloChamado")?.setValueState("None");
            this.byId("textAreaDescricaoChamado")?.setValueState("None");

            this._limparAnexosPendentes();

            this._aplicarRequisitante();

            this._resetWizard();
        },

        // E-mail do usuario logado via UserInfo do shell (Work Zone). Resolve null quando o app
        // roda fora do launchpad ou o servico falha - nunca rejeita.
        _lerUsuarioLogado() {
            // PROVISORIO: com o botao ligado o shell e ignorado e o app se apresenta ao backend
            // como EMAIL_LOCAL_DEV. Ver onAlternarEmailLocal.
            if (this._bEmailLocal) {
                Log.warning("E-mail local ligado: usando " + EMAIL_LOCAL_DEV + " no lugar do usuario do shell",
                    undefined, "megawork.mwmonitorchamados.controller.Main");
                return Promise.resolve(EMAIL_LOCAL_DEV);
            }

            if (typeof sap === "undefined" || !sap.ushell?.Container) {
                // App rodando fora do Fiori Launchpad, sap.ushell nao existe.
                Log.warning("Shell do launchpad indisponivel; o backend resolve o usuario pelo JWT",
                    undefined, "megawork.mwmonitorchamados.controller.Main");
                return Promise.resolve(null);
            }

            return sap.ushell.Container.getServiceAsync("UserInfo")
                .then((oUserInfoService) => oUserInfoService.getUser().getEmail() || null)
                .catch((oError) => {
                    Log.error("Falha ao ler o usuario logado no shell", oError,
                        "megawork.mwmonitorchamados.controller.Main");
                    return null;
                });
        },

        _carregarRequisitante() {
            const oComponent = this.getOwnerComponent();
            const oCodelists = oComponent.getModel("codelists");
            const oOperation = oComponent.getModel().bindContext("/Requisitante(...)");

            // O e-mail vem do UserInfo do shell; sem shell vai null e o backend resolve pelo JWT
            // (app-service.js) - caminho que o frontend nao consegue adulterar.
            return this._lerUsuarioLogado().then((sEmail) => {
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

                oCodelists.setProperty("/clientes", aClientes);
                this._aplicarRequisitante();

                // Sem contatoId ou sem nenhuma empresa vinculada, o resto do app (tickets filtrados
                // por BuyerMainContactPartyID, wizard de criacao) nao tem como funcionar - bloqueia
                // aqui em vez de deixar a tela seguir carregando vazia. O false devolvido e o que
                // impede _carregarTickets de buscar TUDO sem filtro (o if do filtro so entra com
                // contatoId).
                if (!this._sRequisitanteContatoId || !aClientes.length) {
                    MessageBox.error(this._getResourceBundle().getText("requisitanteSemEmpresa"));
                    return false;
                }

                return true;
            }).catch((oError) => {
                Log.error("Falha ao carregar o requisitante", oError, "megawork.mwmonitorchamados.controller.Main");

                MessageBox.error(this._getResourceBundle().getText("requisitanteErroCarregar"));

                return false;
            });
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

        _applyTicketFilters() {
            const oBinding = this.byId("ticketsTable").getBinding("items");
            if (!oBinding) {
                return;
            }

            const aActiveFilters = Object.values(this._mTicketFilters).filter(Boolean);

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

            try {
                const aChamados = await this._buscarChamadosCockpit();

                this._renderizarCockpit(aChamados);

                return true;
            } catch (oError) {
                Log.error("Falha ao carregar o cockpit a partir do C4C", oError,
                    "megawork.mwmonitorchamados.controller.Main");
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
            const aFiltros = [new Filter("BuyerMainContactPartyID", FilterOperator.EQ, this._sRequisitanteContatoId)];

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
        }
    });
});
