package com.clarivate.notificationservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI notificationServiceOpenAPI() {

        return new OpenAPI()
                .info(new Info()
                        .title("Notification Service API")
                        .description("REST APIs for managing notifications in the Research Knowledge Management System")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("RKMS Team")
                                .email("support@rkms.com")));
    }

}