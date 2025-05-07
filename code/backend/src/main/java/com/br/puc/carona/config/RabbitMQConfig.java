package com.br.puc.carona.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${app.rabbitmq.exchanges.carpool}")
    private String carpoolExchange;

    @Value("${app.rabbitmq.queues.notifications}")
    private String notificationsQueue;

    @Value("${app.rabbitmq.queues.rides-created}")
    private String ridesCreatedQueue;

    @Value("${app.rabbitmq.queues.rides-updated}")
    private String ridesUpdatedQueue;

    @Value("${app.rabbitmq.queues.rides-request}")
    private String ridesRequestQueue;

    // Message converter
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // Configure RabbitTemplate
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }

    // Exchanges
    @Bean
    public TopicExchange carpoolExchange() {
        return new TopicExchange(carpoolExchange);
    }

    // Queues
    @Bean
    public Queue ridesRequestQueue() {
        return QueueBuilder.durable(ridesRequestQueue)
                .withArgument("x-dead-letter-exchange", "")
                .withArgument("x-dead-letter-routing-key", ridesRequestQueue + ".dlq")
                .build();
    }

    @Bean
    public Queue ridesRequestDlq() {
        return QueueBuilder.durable(ridesRequestQueue + ".dlq").build();
    }
    @Bean
    public Queue notificationsQueue() {
        return QueueBuilder.durable(notificationsQueue)
                .withArgument("x-dead-letter-exchange", "")
                .withArgument("x-dead-letter-routing-key", notificationsQueue + ".dlq")
                .build();
    }

    @Bean
    public Queue notificationsDlq() {
        return QueueBuilder.durable(notificationsQueue + ".dlq").build();
    }

    @Bean
    public Queue ridesCreatedQueue() {
        return QueueBuilder.durable(ridesCreatedQueue)
                .withArgument("x-dead-letter-exchange", "")
                .withArgument("x-dead-letter-routing-key", ridesCreatedQueue + ".dlq")
                .build();
    }

    @Bean
    public Queue ridesCreatedDlq() {
        return QueueBuilder.durable(ridesCreatedQueue + ".dlq").build();
    }

    @Bean
    public Queue ridesUpdatedQueue() {
        return QueueBuilder.durable(ridesUpdatedQueue)
                .withArgument("x-dead-letter-exchange", "")
                .withArgument("x-dead-letter-routing-key", ridesUpdatedQueue + ".dlq")
                .build();
    }

    @Bean
    public Queue ridesUpdatedDlq() {
        return QueueBuilder.durable(ridesUpdatedQueue + ".dlq").build();
    }

    // Bindings
    @Bean
    public Binding notificationsBinding() {
        return BindingBuilder
                .bind(notificationsQueue())
                .to(carpoolExchange())
                .with("notification.#");
    }

    @Bean
    public Binding ridesCreatedBinding() {
        return BindingBuilder
                .bind(ridesCreatedQueue())
                .to(carpoolExchange())
                .with("ride.created");
    }

    @Bean
    public Binding ridesUpdatedBinding() {
        return BindingBuilder
                .bind(ridesUpdatedQueue())
                .to(carpoolExchange())
                .with("ride.updated");
    }

    @Bean
    public Binding ridesRequestBinding() {
        return BindingBuilder
                .bind(ridesRequestQueue())
                .to(carpoolExchange())
                .with("ride.request");
    }

    @Bean(name = "ridesRequestQueueName")
    public String newRideRequestQueueName() {
        return ridesRequestQueue;
    }
}