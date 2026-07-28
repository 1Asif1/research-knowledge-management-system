package com.clarivate.apigateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "spring.main.web-application-type=none",
        "spring.autoconfigure.exclude=org.springframework.cloud.gateway.config.GatewayAutoConfiguration,org.springframework.boot.webflux.autoconfigure.WebFluxAutoConfiguration"
})
class ApiGatewayApplicationTests {

    @Test
    void contextLoads() {
    }

}
