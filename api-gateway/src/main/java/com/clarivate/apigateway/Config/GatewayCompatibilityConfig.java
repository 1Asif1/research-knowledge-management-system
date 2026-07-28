package com.clarivate.apigateway.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayCompatibilityConfig {

    @Bean
    public org.springframework.boot.autoconfigure.web.ServerProperties serverProperties() {
        return new org.springframework.boot.autoconfigure.web.ServerProperties();
    }

    @Bean
    public org.springframework.boot.autoconfigure.web.reactive.WebFluxProperties webFluxProperties() {
        return new org.springframework.boot.autoconfigure.web.reactive.WebFluxProperties();
    }
}
