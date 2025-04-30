package com.br.puc.carona.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class FcmService {

    private static final String FCM_API_URL = "https://fcm.googleapis.com/v1/projects/carona-c9eba/messages:send";
    private static final String SCOPE = "https://www.googleapis.com/auth/firebase.messaging";

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void enviarNotificacao(String deviceToken, String titulo, String corpo) throws Exception {
        GoogleCredentials credentials = GoogleCredentials
                .fromStream(new FileInputStream("carona-c9eba-firebase-adminsdk-fbsvc-36291ddbf8.json"))
                .createScoped(List.of(SCOPE));
        credentials.refreshIfExpired();

        String accessToken = credentials.getAccessToken().getTokenValue();

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(FCM_API_URL))
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(criarPayload(deviceToken, titulo, corpo)))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("Status: " + response.statusCode());
        System.out.println("Resposta: " + response.body());
    }

    private String criarPayload(String token, String titulo, String corpo) throws JsonProcessingException {
        Map<String, Object> message = Map.of(
                "message", Map.of(
                        "token", token,
                        "notification", Map.of(
                                "title", titulo,
                                "body", corpo
                        )
                )
        );
        return objectMapper.writeValueAsString(message);
    }
}
