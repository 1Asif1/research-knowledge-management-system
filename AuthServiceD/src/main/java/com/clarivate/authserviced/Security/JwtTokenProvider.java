package com.clarivate.authserviced.Security;

import com.clarivate.authserviced.Config.JWTConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Component
public class JwtTokenProvider {
    private final JWTConfig jwtConfig;

    public JwtTokenProvider(JWTConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtConfig.getSecretKey().getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username) {
        return generateToken(username, null);
    }

    public String generateToken(String username, String role) {
        return generateToken(username, role, Map.of());
    }

    public String generateToken(String username, String role, Map<String, Object> additionalClaims) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtConfig.getExpiration());

        var builder = Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiry);

        if (additionalClaims != null && !additionalClaims.isEmpty()) {
            additionalClaims.forEach(builder::claim);
        }

        if (role != null) {
            builder.claim("role", role);
        }

        return builder.signWith(getSigningKey()).compact();
    }

    public String extractUsername(String token) {
        Claims claims = parseClaims(token);
        return claims.getSubject();
    }

    public String getEmail(String token) {
        return extractUsername(token);
    }

    public String getRole(String token) {
        Claims claims = parseClaims(token);
        return claims.get("role", String.class);
    }

    public String getFirstName(String token) {
        return parseClaims(token).get("firstname", String.class);
    }

    public String getLastName(String token) {
        return parseClaims(token).get("lastname", String.class);
    }

    public Long getUserId(String token) {
        Object value = parseClaims(token).get("userId");
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String stringValue && !stringValue.isBlank()) {
            return Long.parseLong(stringValue);
        }
        return null;
    }

    public boolean isTokenValid(String token) {
        try{
            parseClaims(token);
            return true;
        }catch(JwtException | IllegalArgumentException e){
            return false;
        }
    }

    public boolean validateToken(String token) {
        return isTokenValid(token);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
