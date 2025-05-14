package com.br.puc.carona.config;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;
import java.util.function.Supplier;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.WebClient;

import com.google.auth.oauth2.GoogleCredentials;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class FcmConfig {

    private static final String SCOPE = "https://www.googleapis.com/auth/firebase.messaging";

    @Value("${fcm.credentials-file}")
    private String fcmCredentialsFile;
    
    @Value("${fcm.base-url}")
    private String fcmBaseUrl;

    @Bean
    public GoogleCredentials fcmCredentials() {
        try {
            return GoogleCredentials
                .fromStream(new FileInputStream(fcmCredentialsFile))
                .createScoped(List.of(SCOPE));
        } catch (IOException e) {
            log.error("Failed to load FCM credentials from file: {}", fcmCredentialsFile, e);
            throw new RuntimeException("Failed to initialize FCM credentials", e);
        }
    }

    @Bean(name = "fcmWebClient")
    public WebClient fcmWebClient(WebClient.Builder builder, GoogleCredentials credentials) {
        return builder
            .baseUrl(fcmBaseUrl)
            .defaultHeaders(headers -> {
                // We use a Supplier to ensure token is refreshed when needed
                headers.add(HttpHeaders.AUTHORIZATION, 
                    "Bearer " + getAccessToken(credentials));
            })
            .build();
    }
    
    @Bean
    public Supplier<String> fcmTokenSupplier(GoogleCredentials credentials) {
        return () -> getAccessToken(credentials);
    }
    
    private String getAccessToken(GoogleCredentials credentials) {
        try {
            credentials.refreshIfExpired();
            return credentials.getAccessToken().getTokenValue();
        } catch (IOException e) {
            log.error("Failed to refresh FCM access token", e);
            throw new RuntimeException("Failed to get FCM access token", e);
        }
    }
}