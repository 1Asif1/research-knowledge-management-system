package com.clarivate.paperservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(classes = PaperServiceApplicationTests.TestApplication.class, properties = "spring.main.web-application-type=none")
class PaperServiceApplicationTests {

    @Test
    void contextLoads() {
    }

    @SpringBootConfiguration
    static class TestApplication {
    }
}
