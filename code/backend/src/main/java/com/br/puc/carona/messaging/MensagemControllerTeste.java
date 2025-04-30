package com.br.puc.carona.messaging;

import com.br.puc.carona.service.FcmService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.br.puc.carona.dto.testeMessageDTO;

/*
 * Esta é uma classe usada apenas para testes envolvendo mensageria com rabbitmq, não deve ser usada em produção.
 * Após a conclusão do trabalho, esta classe deve ser removida.
 * 
 * Por enquanto, sintam-se à vontade para usar esta classe para testar o envio de mensagens.
 */


@RestController
@RequiredArgsConstructor
public class MensagemControllerTeste {

    private final MensagemProducer mensagemProducer;

    private final FcmService fcmService;

    @GetMapping("/send")
    public String sendMessage() {
        testeMessageDTO message = new testeMessageDTO("Hello, World!");
        mensagemProducer.enviarMensagemParaNotifications(message);
        return "Message sent: " + message;
    }

    @GetMapping("/fcmsend")
    public String sendPushNotification() throws Exception{
        Long id = 4L; // precisa ser real
        String titulo = "Nova Solicitação de Carona!";
        String corpo = "Alguém perto de você está solicitando uma carona.";

        fcmService.enviarNotificacao(id, titulo, corpo);
        return "push notification sent";
    }
}