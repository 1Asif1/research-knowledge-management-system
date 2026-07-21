package com.clarivate.authserviced.Controller;

import com.clarivate.authserviced.Dto.Request.LoginRequest;
import com.clarivate.authserviced.Dto.Response.LoginResponse;
import com.clarivate.authserviced.Dto.Response.ValidateTokenResponse;
import com.clarivate.authserviced.Service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request){
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/validate")
    public ResponseEntity<ValidateTokenResponse> validateToken(@RequestHeader("Authorization")String token){
        String normalizedToken = token != null && token.startsWith("Bearer ") ? token.substring(7) : token;
        return ResponseEntity.ok(authService.validateToken(normalizedToken));
    }
}
