//package com.br.puc.carona.service;
//
//import java.util.Map;
//
//import org.springframework.beans.factory.annotation.Qualifier;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.MediaType;
//import org.springframework.stereotype.Service;
//import org.springframework.web.reactive.function.client.WebClient;
//
//import com.fasterxml.jackson.core.JsonProcessingException;
//import com.fasterxml.jackson.databind.ObjectMapper;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//
//@Service
//@Slf4j
//@RequiredArgsConstructor
//public class FCMPushServicevice {
//
//    @Value("${fcm.project-name}")
//    private String projectName;
//
//    private final EstudanteService estudanteService;
//    @Qualifier("fcmWebClient")
//    private final WebClient fcmWebClient;
//    private final ObjectMapper objectMapper;
//
//    public void enviarNotificacao(final Long estudanteId, final String titulo, final String corpo) throws JsonProcessingException {
//        final String deviceToken = estudanteService.buscarDeviceTokenPorId(estudanteId);
//        final String payload = criarPayload(deviceToken, titulo, corpo);
//
//        final String projectPath = new StringBuilder()
//                .append("projects/")
//                .append(projectName)
//                .append("/messages:send")
//                .toString();
//
//        final String response = fcmWebClient.post()
//                .uri(projectPath)
//                .contentType(MediaType.APPLICATION_JSON)
//                .bodyValue(payload)
//                .retrieve()
//                .bodyToMono(String.class)
//                .block();
//
//        log.info("FCM Response: {}", response);
//    }
//
//    private String criarPayload(final String token, final String titulo, final String corpo) throws JsonProcessingException {
//        final Map<String, Object> message = Map.of(
//                "message", Map.of(
//                        "token", token,
//                        "notification", Map.of(
//                                "title", titulo,
//                                "body", corpo)));
//        return objectMapper.writeValueAsString(message);
//    }
//}
