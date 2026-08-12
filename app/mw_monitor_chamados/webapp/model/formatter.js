sap.ui.define([
    "sap/ui/core/format/DateFormat"
], function (DateFormat) {
    "use strict";

    // a partir de quantos caracteres a descricao ja e considerada suficiente
    var DESCRICAO_MINIMA_BOA = 40;

    // Estado terminal do eixo Status (ServiceRequestUserLifeCycleStatusCode), lista unica do app:
    // "5"/"6" sao o que os botoes Finalizar/Cancelar gravam, "CLOSED" chega na leitura.
    var A_STATUS_ENCERRADO = ["CLOSED", "5", "6"];

    function bPreenchido(sValor) {
        return !!(sValor && String(sValor).trim());
    }

    // Funcao de modulo (nao metodo): formatter chamado do XML nao recebe o formatter como "this".
    function bStatusEncerrado(sCode) {
        return A_STATUS_ENCERRADO.indexOf(String(sCode == null ? "" : sCode).trim().toUpperCase()) >= 0;
    }

    // Familia do ProcessingTypeCodeText: o tenant manda "Melhoria - Cross" e "Alocação" acentuada,
    // o mock manda "Melhoria" - sao a MESMA familia.
    function sFamiliaTipo(sTipo) {
        return String(sTipo || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .split(" - ")[0]
            .trim();
    }

    // Aceita ISO e o formato C4C "/Date(1722520200000)/".
    function oDataDeTexto(sData) {
        if (!sData) {
            return null;
        }

        var sTexto = String(sData).trim();

        var aMatch = sTexto.match(/^\/Date\((\d+)\)\/$/);
        if (aMatch && aMatch[1]) {
            return new Date(parseInt(aMatch[1], 10));
        }

        var oDate = new Date(sTexto);
        if (!isNaN(oDate.getTime())) {
            return oDate;
        }

        return null;
    }

    return {

        /**
         * ValueState da prioridade (ServicePriorityCode: 1=Imediata, 2=Urgente, 3=Normal, 7=Baixa).
         * Success nao entra neste eixo: e exclusivo de estado terminal de ciclo de vida.
         */
        prioridadeState: function (sCode) {
            switch (sCode) {
                case "1":
                    return "Error";
                case "2":
                    return "Warning";
                case "3":
                case "7":
                    return "Information";
                default:
                    return "None";
            }
        },

        /**
         * Icone da prioridade (ServicePriorityCode). Nao unificar circle-task-2 / circle-task:
         * 3 e 7 dividem Information, o icone e o unico separador entre Normal e Baixa.
         */
        prioridadeIcone: function (sCode) {
            switch (sCode) {
                case "1":
                    return "sap-icon://error";
                case "2":
                    return "sap-icon://warning";
                case "3":
                    return "sap-icon://circle-task-2";
                case "7":
                    return "sap-icon://circle-task";
                default:
                    return "";
            }
        },

        /**
         * ValueState do status Z do tenant (ServiceRequestUserLifeCycleStatusCode), nao da Situacao.
         * Z6/OPEN/1=Aberto, 2=Em Processamento, 4=Acao do Cliente, 5=Concluido, CLOSED/6=Fechado.
         */
        statusState: function (sCode) {
            if (bStatusEncerrado(sCode)) {
                return "Success";
            }

            switch (sCode) {
                case "Z6":
                case "OPEN":
                case "1":
                case "2":
                    return "Information";
                case "4":
                    return "Warning";
                // Lista Z aberta: None tem de continuar significando "code novo, ninguem conferiu".
                default:
                    return "None";
            }
        },

        /**
         * Chamado encerrado pelo eixo Status Z. Unica fonte da regra "encerrado nao recebe acao"
         * (enabled dos botoes Finalizar/Cancelar, FeedInput do chat e guarda de envio de mensagem).
         */
        chamadoEncerrado: function (sCode) {
            return bStatusEncerrado(sCode);
        },

        /**
         * ValueState do tipo (texto livre - casa por familia normalizada). Chamados antigos trazem
         * Z051=Incidente, Z053=Garantia, Z050=Melhoria, Z052=Estimativa, Z054=Alocacao, Z055=Projeto;
         * os novos sao SRRQ e chegam aqui ja como "Incidente" (rotulo posto pelo _tipoTexto).
         */
        tipoState: function (sTipo) {
            switch (sFamiliaTipo(sTipo)) {
                case "incidente":
                    return "Error";
                case "garantia":
                    return "Warning";
                case "melhoria":
                case "estimativa":
                case "projeto":
                case "alocacao":
                case "tarefa":
                case "suporte interno":
                    return "Information";
                // Dominio de texto livre: o tenant pode cadastrar tipo novo sem avisar o app.
                default:
                    return "None";
            }
        },

        /**
         * ValueState da situacao (ServiceRequestLifeCycleStatusCode: 1=Aberto, 2=Em processamento,
         * 3=Acao do cliente, 4=Concluido, 5=Encerrado). statusState copia daqui a cor por significado.
         */
        situacaoState: function (sCode) {
            switch (sCode) {
                case "1":
                case "2":
                    return "Information";
                case "3":
                    return "Warning";
                case "4":
                case "5":
                    return "Success";
                default:
                    return "None";
            }
        },

        /**
         * Icone da situacao (ServiceRequestLifeCycleStatusCode). accept x locked e o que distingue
         * Concluido de Encerrado, ja que os dois sao Success.
         */
        situacaoIcone: function (sCode) {
            switch (sCode) {
                case "1":
                    return "sap-icon://document";
                case "2":
                    return "sap-icon://in-progress";
                case "3":
                    return "sap-icon://pending";
                case "4":
                    return "sap-icon://accept";
                case "5":
                    return "sap-icon://locked";
                default:
                    return "";
            }
        },

        /**
         * Nome do responsavel (ProcessorPartyName ja vem pronto do C4C).
         * @param {string} [sNaoAtribuido] texto i18n vindo como segunda parte do binding
         */
        responsavelTexto: function (sNome, sNaoAtribuido) {
            var sTexto = String(sNome || "").trim();

            return sTexto || sNaoAtribuido || "Não atribuído";
        },

        /** Data ISO no padrao pt-BR com hora. */
        dataAbertura: function (sIso) {
            if (!sIso) {
                return "";
            }
            var oDate = new Date(sIso);
            if (isNaN(oDate.getTime())) {
                return sIso;
            }
            var oDateFormat = DateFormat.getDateTimeInstance({
                pattern: "dd/MM/yyyy HH:mm"
            });
            return oDateFormat.format(oDate);
        },

        /**
         * Icone do status Z (mesmos cases de statusState). Cada desenho e o mesmo que situacaoIcone
         * da ao significado equivalente - trocar aqui obriga a trocar o par la.
         */
        statusIcone: function (sCode) {
            switch (sCode) {
                case "Z6":
                case "OPEN":
                case "1":
                    return "sap-icon://document";
                case "2":
                    return "sap-icon://in-progress";
                case "4":
                    return "sap-icon://pending";
                case "5":
                    return "sap-icon://accept";
                case "CLOSED":
                case "6":
                    return "sap-icon://locked";
                default:
                    return "";
            }
        },

        /** Data ISO curta (sem hora). Sem consumidor hoje: as telas usam dataAbertura. */
        dataCurta: function (sIso, sVazio) {
            if (!sIso) {
                return sVazio || "";
            }
            var oDate = new Date(sIso);
            if (isNaN(oDate.getTime())) {
                return sIso;
            }
            var oDateFormat = DateFormat.getDateInstance({
                pattern: "dd/MM/yyyy"
            });
            return oDateFormat.format(oDate);
        },

        /** Texto quando preenchido, senao o fallback i18n. */
        textoOuTraco: function (sTexto, sVazio) {
            return bPreenchido(sTexto) ? sTexto : (sVazio || "");
        },

        /** Count das abas; tolera undefined (chamado recem criado ainda sem historico/chat/anexos). */
        contagem: function (aItens) {
            return String(Array.isArray(aItens) ? aItens.length : 0);
        },

        historicoIcone: function (bSistema) {
            return bSistema ? "sap-icon://history" : "sap-icon://employee";
        },

        anexoIcone: function (sNome) {
            var sExtensao = String(sNome || "").toLowerCase().split(".").pop();

            switch (sExtensao) {
                case "pdf":
                    return "sap-icon://pdf-attachment";
                case "png":
                case "jpg":
                case "jpeg":
                case "gif":
                case "bmp":
                    return "sap-icon://attachment-photo";
                case "doc":
                case "docx":
                    return "sap-icon://doc-attachment";
                case "xls":
                case "xlsx":
                case "csv":
                    return "sap-icon://excel-attachment";
                case "zip":
                case "rar":
                case "7z":
                    return "sap-icon://attachment-zip-file";
                case "txt":
                case "log":
                    return "sap-icon://attachment-text-file";
                default:
                    return "sap-icon://document";
            }
        },

        dicaDescricao: function (sDescricao, sDica, sDicaOk) {
            return (sDescricao || "").trim().length >= DESCRICAO_MINIMA_BOA ? sDicaOk : sDica;
        },

        dicaDescricaoState: function (sDescricao) {
            return (sDescricao || "").trim().length >= DESCRICAO_MINIMA_BOA ? "Success" : "Information";
        },

        dicaDescricaoIcone: function (sDescricao) {
            return (sDescricao || "").trim().length >= DESCRICAO_MINIMA_BOA
                ? "sap-icon://sys-enter-2"
                : "sap-icon://hint";
        },

        /** Descricao de um code em qualquer codelist ({code, descricao}); serve tipo e prioridade. */
        codelistTexto: function (sCode, aCodelist) {
            if (!sCode) {
                return "";
            }
            if (Array.isArray(aCodelist)) {
                for (var i = 0; i < aCodelist.length; i++) {
                    if (aCodelist[i].code === sCode) {
                        return aCodelist[i].descricao;
                    }
                }
            }
            return sCode;
        },

        /** Resumo plural do passo de revisao; o {0} do padrao i18n e substituido aqui. */
        anexosResumo: function (aAnexos, sSemAnexo, sUmArquivo, sVariosArquivos) {
            var iQuantidade = Array.isArray(aAnexos) ? aAnexos.length : 0;

            if (!iQuantidade) {
                return sSemAnexo || "";
            }
            if (iQuantidade === 1) {
                return sUmArquivo || "";
            }

            return String(sVariosArquivos || "").replace("{0}", String(iQuantidade));
        },

        /** Anexo e opcional: ausencia nao e erro nem alerta. */
        anexosState: function (aAnexos) {
            return (Array.isArray(aAnexos) ? aAnexos.length : 0) > 0 ? "Success" : "None";
        },

        /**
         * Legenda da linha de anexo: tamanho, data e autor, so o que existir. O C4C nao tem campo
         * de tamanho nesta entidade (so o upload da sessao conhece os bytes) e CreatedBy costuma
         * vir vazio - por isso nada de separador orfao.
         */
        anexoLegenda: function (sTamanho, sQuando, sAutor) {
            var aPartes = [];

            if (bPreenchido(sTamanho)) {
                aPartes.push(String(sTamanho).trim());
            }

            var oDate = oDataDeTexto(sQuando);
            if (oDate) {
                aPartes.push(DateFormat.getDateTimeInstance({
                    pattern: "dd/MM/yyyy HH:mm"
                }).format(oDate));
            }

            if (bPreenchido(sAutor)) {
                aPartes.push(String(sAutor).trim());
            }

            return aPartes.join(" · ");
        },

        // Os quatro formatters timeline* nao tem consumidor em tela; sao a API documentada em docs/.

        timelineDataAgrupamento: function (sDataEvento) {
            if (!sDataEvento) {
                return "";
            }

            var oDate = oDataDeTexto(sDataEvento);
            if (!oDate || isNaN(oDate.getTime())) {
                return "";
            }

            var oDateFormat = DateFormat.getDateInstance({
                pattern: "dd/MM/yyyy"
            });
            return oDateFormat.format(oDate);
        },

        timelineDataTimeFormatada: function (sDataEvento) {
            if (!sDataEvento) {
                return "";
            }

            var oDate = oDataDeTexto(sDataEvento);
            if (!oDate || isNaN(oDate.getTime())) {
                return "";
            }

            var oDateFormat = DateFormat.getDateTimeInstance({
                pattern: "dd/MM/yyyy HH:mm"
            });
            return oDateFormat.format(oDate);
        },

        timelineIconeSistema: function (bSistema) {
            return bSistema ? "sap-icon://sys-help-2" : "sap-icon://employee";
        },

        timelineCorSistema: function (bSistema) {
            return bSistema ? "#0066CC" : "#4CAF50";
        },

        /** Alias publico de oDataDeTexto, mantido como API documentada em docs/. */
        _parseData: function (sData) {
            return oDataDeTexto(sData);
        }
    };
});
