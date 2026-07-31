package com.clarivate.authserviced.Service;

import com.clarivate.authserviced.Client.UserServiceClient;
import com.clarivate.authserviced.Config.StaticAdminConfig;
import com.clarivate.authserviced.Dto.Request.LoginRequest;
import com.clarivate.authserviced.Dto.Response.LoginResponse;
import com.clarivate.authserviced.Dto.Response.UserResponse;
import com.clarivate.authserviced.Dto.Response.ValidateTokenResponse;
import com.clarivate.authserviced.Entity.Role;
import com.clarivate.authserviced.Security.JwtTokenProvider;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserServiceClient userServiceClient;

    private final JwtTokenProvider jwtTokenProvider;
    private final StaticAdminConfig staticAdminConfig;

    public AuthServiceImpl(UserServiceClient userServiceClient, JwtTokenProvider jwtTokenProvider, StaticAdminConfig staticAdminConfig) {
        this.userServiceClient = userServiceClient;
        this.jwtTokenProvider = jwtTokenProvider;
        this.staticAdminConfig = staticAdminConfig;
    }

    @Override
    public LoginResponse login(LoginRequest request){
        if (isStaticAdminLogin(request)) {
            return buildStaticAdminLoginResponse();
        }

        UserResponse user = userServiceClient.validateUser(request);
        String token = jwtTokenProvider.generateToken(
                user.getEmail(),
                user.getRole() != null ? user.getRole().name() : null,
                Map.of(
                        "userId", user.getUuid(),
                        "firstname", user.getFirstname(),
                        "lastname", user.getLastname(),
                        "email", user.getEmail()
                )
        );
        return new LoginResponse(
                token, user.getUuid(), user.getFirstname(), user.getLastname(), user.getEmail(), user.getRole(), "Login successful"
        );
    }

    private boolean isStaticAdminLogin(LoginRequest request) {
        if (request == null || !staticAdminConfig.isEnabled()) {
            return false;
        }

        String requestEmail = request.getEmail();
        String requestPassword = request.getPassword();

        return requestEmail != null
                && requestPassword != null
                && requestEmail.equalsIgnoreCase(staticAdminConfig.getEmail())
                && requestPassword.equals(staticAdminConfig.getPassword());
    }

    private LoginResponse buildStaticAdminLoginResponse() {
        String token = jwtTokenProvider.generateToken(
                staticAdminConfig.getEmail(),
                Role.ADMIN.name(),
                Map.of(
                        "userId", 0L,
                        "firstname", staticAdminConfig.getFirstName(),
                        "lastname", staticAdminConfig.getLastName(),
                        "email", staticAdminConfig.getEmail()
                )
        );

        return new LoginResponse(
                token,
                0L,
                staticAdminConfig.getFirstName(),
                staticAdminConfig.getLastName(),
                staticAdminConfig.getEmail(),
                Role.ADMIN,
                "Login successful"
        );
    }

    @Override
    public ValidateTokenResponse validateToken(String token) {
        boolean valid = jwtTokenProvider.validateToken(token);
        if(!valid){
            return new ValidateTokenResponse(false, null, null, null, null);
        }
        String roleValue = jwtTokenProvider.getRole(token);
        Role role;
        try {
            role = roleValue != null ? Role.valueOf(roleValue) : null;
        } catch (IllegalArgumentException ex) {
            return new ValidateTokenResponse(false, null, null, null, null);
        }
        return new ValidateTokenResponse(
                true,
                jwtTokenProvider.getEmail(token),
                jwtTokenProvider.getFirstName(token),
                jwtTokenProvider.getLastName(token),
                role
        );

    }

}
