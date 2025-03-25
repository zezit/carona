package com.br.puc.carona.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class ApiDocumentationConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Carona? API")
                        .version("0.0.1-SNAPSHOT")
                        .description(
                                "API para o sistema Carona? - Uma solução para facilitar a mobilidade dos estudantes da PUC Minas através de compartilhamento de caronas"));
    }

    @Bean
    public GroupedOpenApi Api() {
        return GroupedOpenApi.builder()
                .group("com.br.puc.carona")
                .pathsToMatch("/**")
                .packagesToScan("com.br.puc.carona")
                .build();
    }
}
