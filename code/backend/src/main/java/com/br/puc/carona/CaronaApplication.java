package com.br.puc.carona;

import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableRabbit
@EnableScheduling
@SpringBootApplication
public class CaronaApplication {

    public static void main(String[] args) {
        SpringApplication.run(CaronaApplication.class, args);
    }

}
