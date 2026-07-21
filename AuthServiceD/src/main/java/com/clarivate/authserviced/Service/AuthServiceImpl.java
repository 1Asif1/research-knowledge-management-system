package com.clarivate.authserviced.Service;

import com.clarivate.authserviced.Client.UserServiceClient;
import com.clarivate.authserviced.Dto.Request.LoginRequest;
import com.clarivate.authserviced.Dto.Response.LoginResponse;
import com.clarivate.authserviced.Dto.Response.UserResponse;
import com.clarivate.authserviced.Dto.Response.ValidateTokenResponse;
import com.clarivate.authserviced.Entity.Role;
import com.clarivate.authserviced.Security.JwtTokenProvider;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserServiceClient userServiceClient;

    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(UserServiceClient userServiceClient, JwtTokenProvider jwtTokenProvider) {
        this.userServiceClient = userServiceClient;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public LoginResponse login(LoginRequest request){
        UserResponse user = userServiceClient.validateUser(request);
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole() != null ? user.getRole().name() : null);
        return new LoginResponse(
                token, user.getUuid(), user.getFirstname(), user.getLastname(), user.getEmail(), user.getRole(), "Login successful"
        );
    }

    @Override
    public ValidateTokenResponse validateToken(String token) {
        boolean valid = jwtTokenProvider.validateToken(token);
        if(!valid){
            return new ValidateTokenResponse(false, null, null, null);
        }
        String roleValue = jwtTokenProvider.getRole(token);
        Role role = roleValue != null ? Role.valueOf(roleValue) : null;
        return new ValidateTokenResponse(true, null, null, role);

    }

}
