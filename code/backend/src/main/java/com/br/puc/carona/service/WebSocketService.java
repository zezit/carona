package com.br.puc.carona.service;

import com.br.puc.carona.dto.response.CaronaDto;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.model.Carona;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {


    private final SimpMessagingTemplate messagingTemplate;


    public void emitirEventoCaronaIniciada(Carona carona) {
        messagingTemplate.convertAndSend("/topic/carona/" + carona.getId() + "/iniciada", carona);
    }

    public void emitirEventoCaronaAtualizada(CaronaDto caronadto) {
        messagingTemplate.convertAndSend("/topic/carona/" + caronadto.getId() + "/iniciada", caronadto);
    }

    public void emitirEventoCaronaIniciada(Long id){
        Carona carona = Carona.builder()
                .motorista(null)
                .pontoPartida("PUC Minas - Campus Coração Eucarístico")
                .pontoDestino("Terminal Vilarinho")
                .latitudePartida(-19.922900)
                .longitudePartida(-43.994411)
                .latitudeDestino(-19.812718)
                .longitudeDestino(-43.954882)
                .dataHoraPartida(LocalDateTime.now().plusHours(1))
                .dataHoraChegada(LocalDateTime.now().plusHours(2))
                .vagas(4)
                .status(StatusCarona.AGENDADA)
                .observacoes("Saindo do estacionamento principal. Por favor, seja pontual.")
                .distanciaEstimadaMetros(15.7)
                .tempoEstimadoSegundos(2400.00)
                .tempoGastoSegundos(null)
                // Collections já têm valores default conforme anotação @Builder.Default
                .build();

        String destino = "/topic/carona/" + id + "/iniciada";

        log.info("enviando para rota {}", destino);

        messagingTemplate.convertAndSend(destino, carona);

    }

    public void emitirEventoCaronaIniciada() {
        // Verifique se o destino está configurado corretamente
        messagingTemplate.convertAndSend("/topic/caronas", "Mensagem de Carona Iniciada");
    }



}
