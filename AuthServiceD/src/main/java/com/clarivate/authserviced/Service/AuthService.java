package com.clarivate.authserviced.Service;

import com.clarivate.authserviced.Dto.Request.LoginRequest;
import com.clarivate.authserviced.Dto.Response.LoginResponse;
import com.clarivate.authserviced.Dto.Response.ValidateTokenResponse;
import com.clarivate.authserviced.Security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public interface AuthService {
    LoginResponse login(LoginRequest request);
    ValidateTokenResponse validateToken(String token);
}
