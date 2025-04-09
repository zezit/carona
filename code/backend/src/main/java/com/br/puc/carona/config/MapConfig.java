package com.br.puc.carona.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class MapConfig {

    @Value("${app.nominatim.base-url:https://nominatim.openstreetmap.org}")
    private String nominatimBaseUrl;

    @Bean(name = "nominatimWebClient")
    public WebClient nominatimWebClient(WebClient.Builder builder) {
        return builder.baseUrl(nominatimBaseUrl).build();
    }
    
    @Bean(name = "osrmWebClient")
    public WebClient osrmWebClient(WebClient.Builder builder) {
        return builder.baseUrl("https://router.project-osrm.org").build();
    }
}