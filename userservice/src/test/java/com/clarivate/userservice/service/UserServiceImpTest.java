package com.clarivate.userservice.service;

import com.clarivate.userservice.enums.Role;
import com.clarivate.userservice.model.User;
import com.clarivate.userservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImpTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImp userService;

    @Test
    void searchUsers_returnsAllUsers_whenQueryIsBlank() {
        when(userRepository.findAll()).thenReturn(List.of(user(1L, "Alice", "Khan", "alice@rkms.local", Role.RESEARCHER)));

        var result = userService.searchUsers("   ");

        assertEquals(1, result.size());
        assertEquals("alice@rkms.local", result.getFirst().email());
        verify(userRepository).findAll();
    }

    @Test
    void searchUsers_usesRepositorySearch_whenQueryIsProvided() {
        when(userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                "admin", "admin", "admin"
        )).thenReturn(List.of(user(2L, "System", "Admin", "admin@rkms.local", Role.ADMIN)));

        var result = userService.searchUsers("admin");

        assertEquals(1, result.size());
        assertEquals(Role.ADMIN, result.getFirst().role());
        verify(userRepository).findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                "admin", "admin", "admin"
        );
    }

    private User user(Long id, String firstName, String lastName, String email, Role role) {
        User user = new User();
        user.setUserId(id);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword("encoded");
        user.setRole(role);
        return user;
    }
}
