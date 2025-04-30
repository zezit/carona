package com.br.puc.carona.messaging;

import com.br.puc.carona.service.NotificacaoService;
import com.br.puc.carona.service.PedidoDeEntradaService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
@AllArgsConstructor
public class MensagemConsumer {

    private final NotificacaoService notificacaoService;
    private final PedidoDeEntradaService pedidoEntradaService;

    @RabbitListener(queues = "${app.rabbitmq.queues.notifications}")
    public void processarMensagem(Message<?> mensagem) {
        log.info("Mensagem recebida: {}", mensagem.getPayload());

        try {
            // Verifica se o payload é um Map
            if (mensagem.getPayload() instanceof Map) {
                Map<String, Object> payload = (Map<String, Object>) mensagem.getPayload();

                // Lida com caronaId e solicitacaoId, fazendo a verificação de tipo
                Object caronaIdObj = payload.get("caronaId");
                Object solicitacaoIdObj = payload.get("solicitacaoId");

                Long caronaId = (caronaIdObj instanceof Number) ? ((Number) caronaIdObj).longValue() : null;
                Long solicitacaoId = (solicitacaoIdObj instanceof Number) ? ((Number) solicitacaoIdObj).longValue() : null;

                if (caronaId != null && solicitacaoId != null) {
                    log.info("Carona ID: {}, Solicitação ID: {}", caronaId, solicitacaoId);

                    pedidoEntradaService.processarMensagem(caronaId, solicitacaoId);

                } else {
                    log.error("Valores de caronaId ou solicitacaoId inválidos ou ausentes");
                }
            } else {
                log.error("Payload inesperado, esperava um Map: {}", mensagem.getPayload());
            }
        } catch (Exception e) {
            log.error("Erro ao processar mensagem: {}", e.getMessage(), e);
        }
    }
}
