package com.br.puc.carona.config;

import javax.sql.DataSource;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@TestConfiguration
@Profile("test")
public class TestConfig {
    @Bean
    public PasswordEncoder testPasswordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Primary
    @Bean
    public DataSource dataSource() {
        return DataSourceBuilder.create()
                .url("jdbc:h2:mem:test;MODE=MySQL;")
                .driverClassName("org.h2.Driver")
                .username("")
                .password("")
                .build();
    }
}
