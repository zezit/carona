package com.br.puc.carona.messaging;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.br.puc.carona.dto.testeMessageDTO;




@RestController
@RequiredArgsConstructor
public class MensagemControllerTeste {

    private final MensagemProducer mensagemProducer;

    @GetMapping("/send")
    public String sendMessage() {
        testeMessageDTO message = new testeMessageDTO("Hello, World!");
        mensagemProducer.enviarMensagemParaCaronaRequestQueue(message);
        return "Message sent: " + message;
    }
}