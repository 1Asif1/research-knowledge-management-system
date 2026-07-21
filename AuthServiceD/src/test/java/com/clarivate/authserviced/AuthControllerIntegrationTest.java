package com.clarivate.authserviced;

import com.clarivate.authserviced.Config.JWTConfig;
import com.clarivate.authserviced.Security.JwtTokenProvider;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AuthControllerIntegrationTests {

    @Test
    void generatedTokenContainsUsername() {
        JWTConfig jwtConfig = new JWTConfig();
        jwtConfig.setSecretkey("replace-this-with-a-strong-32-byte-secret-key");
        jwtConfig.setExpiration(3600000);

        JwtTokenProvider tokenProvider = new JwtTokenProvider(jwtConfig);

        String token = tokenProvider.generateToken("user");

        assertTrue(tokenProvider.isTokenValid(token));
        assertEquals("user", tokenProvider.extractUsername(token));
    }
}
