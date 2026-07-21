package com.clarivate.authserviced.Config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JWTConfig {
    @Value("${jwt.secret}")
    private String secretkey;

    @Value("${jwt.expiration-millis}")
    private long expiration;

    public String getSecretKey() {
        return secretkey;
    }

    public long getExpiration() {
        return expiration;
    }

    public void setSecretkey(String secretkey) {
        this.secretkey = secretkey;
    }

    public void setExpiration(long expiration) {
        this.expiration = expiration;
    }
}