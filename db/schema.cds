namespace megawork.mwmonitorchamados;

// Controle de "chamado visualizado" por requisitante: nao guarda mensagem nenhuma, so quando
// cada usuario abriu o chat de cada chamado pela ultima vez. E o que sustenta a notificacao de
// mensagem nova em Chats/sino sobrevivendo a F5 - ver srv/app-service.cds
// (ChamadosComMensagemNova/MarcarChatVisualizado) e Main.controller.js
// (_verificarNotificacoesChats).
entity ChatVisualizacoes {
    key usuario       : String(241); // e-mail do requisitante, mesma identidade de Requisitante
    key ticketId      : String(35);  // ServiceRequests.ID
        visualizadoEm : Timestamp @cds.on.insert: $now @cds.on.update: $now;
}
