package com.clarivate.authserviced.Service;

import com.clarivate.authserviced.Client.UserServiceClient;
import com.clarivate.authserviced.Config.StaticAdminConfig;
import com.clarivate.authserviced.Dto.Request.LoginRequest;
import com.clarivate.authserviced.Dto.Response.LoginResponse;
import com.clarivate.authserviced.Dto.Response.UserResponse;
import com.clarivate.authserviced.Entity.Role;
import com.clarivate.authserviced.Security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private StaticAdminConfig staticAdminConfig;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void login_returnsStaticAdminResponse_whenStaticAdminCredentialsMatch() {
        LoginRequest request = new LoginRequest("admin@rkms.local", "Admin@123456");
        when(staticAdminConfig.isEnabled()).thenReturn(true);
        when(staticAdminConfig.getEmail()).thenReturn("admin@rkms.local");
        when(staticAdminConfig.getPassword()).thenReturn("Admin@123456");
        when(staticAdminConfig.getFirstName()).thenReturn("System");
        when(staticAdminConfig.getLastName()).thenReturn("Admin");
        when(jwtTokenProvider.generateToken(
                ArgumentMatchers.eq("admin@rkms.local"),
                ArgumentMatchers.eq("ADMIN"),
                ArgumentMatchers.<Map<String, Object>>any()
        )).thenReturn("static-admin-token");

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("static-admin-token", response.getToken());
        assertEquals(Role.ADMIN, response.getRole());
        assertEquals("admin@rkms.local", response.getEmail());
        verify(userServiceClient, never()).validateUser(ArgumentMatchers.any(LoginRequest.class));
    }

    @Test
    void login_delegatesToUserService_whenStaticAdminCredentialsDoNotMatch() {
        LoginRequest request = new LoginRequest("researcher@rkms.local", "password123");
        UserResponse userResponse = new UserResponse(
                77L,
                "Riya",
                "Shah",
                "researcher@rkms.local",
                null,
                Role.RESEARCHER,
                "Login successful"
        );

        when(staticAdminConfig.isEnabled()).thenReturn(true);
        when(staticAdminConfig.getEmail()).thenReturn("admin@rkms.local");
        when(userServiceClient.validateUser(request)).thenReturn(userResponse);
        when(jwtTokenProvider.generateToken(
                ArgumentMatchers.eq("researcher@rkms.local"),
                ArgumentMatchers.eq("RESEARCHER"),
                ArgumentMatchers.<Map<String, Object>>any()
        )).thenReturn("user-token");

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("user-token", response.getToken());
        assertEquals(Role.RESEARCHER, response.getRole());
        assertEquals(77L, response.getUuid());
        verify(userServiceClient).validateUser(request);
    }
}
