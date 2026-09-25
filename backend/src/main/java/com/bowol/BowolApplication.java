package com.bowol;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * BOWOL Platform - Main Spring Boot Application Entry Point
 * Monolito Modular: Intelligence -> Strategy -> Execution
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableJpaAuditing
@EnableAsync
public class BowolApplication {

    public static void main(String[] args) {
        SpringApplication.run(BowolApplication.class, args);
    }
}
