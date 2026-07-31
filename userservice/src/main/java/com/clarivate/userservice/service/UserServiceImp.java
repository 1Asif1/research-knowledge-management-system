package com.clarivate.userservice.service;

import com.clarivate.userservice.dto.UpdateUserRequest;
import com.clarivate.userservice.dto.UserLoginResponse;
import com.clarivate.userservice.dto.UserRequest;
import com.clarivate.userservice.dto.UserResponse;
import com.clarivate.userservice.exception.ResourceNotFoundException;
import com.clarivate.userservice.model.User;
import com.clarivate.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
@RequiredArgsConstructor
public class UserServiceImp implements UserService {

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse createUser(UserRequest request) {
        if (repo.existsByEmail(request.email())) {
            throw new ResponseStatusException(CONFLICT, "This email is already registered.");
        }

        User user = new User();

        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());

        User savedUser = repo.save(user);

        return mapToResponse(savedUser);
    }

    @Override
    public List<UserResponse> getAllUsers() {

        return repo.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<UserResponse> searchUsers(String query) {
        if (query == null || query.isBlank()) {
            return getAllUsers();
        }

        String normalizedQuery = query.trim();
        return repo.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        normalizedQuery,
                        normalizedQuery,
                        normalizedQuery
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public UserResponse getUserById(Long id) throws ResourceNotFoundException {

        User user = repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id " + id));

        return mapToResponse(user);
    }

    @Override
    public UserResponse getUserByEmail(String email) throws ResourceNotFoundException {

        User user = repo.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with email " + email));

        return mapToResponse(user);
    }

    @Override
    public UserLoginResponse login(String email, String password) throws ResourceNotFoundException {
        User user = repo.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with email " + email));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
        }

        return new UserLoginResponse(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                null,
                user.getRole(),
                "Login successful"
        );
    }

    @Override
    public UserResponse updateUser(Long id, UpdateUserRequest request) throws ResourceNotFoundException {

        User user = repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id " + id));

        if (request.firstName() != null) {
            user.setFirstName(request.firstName());
        }

        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }

        if (request.role() != null) {
            user.setRole(request.role());
        }

        User updatedUser = repo.save(user);

        return mapToResponse(updatedUser);
    }

    @Override
    public void deleteUser(Long id) throws ResourceNotFoundException {

        User user = repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id " + id));

        repo.delete(user);
    }

    /**
     * Converts Entity -> DTO
     */
    private UserResponse mapToResponse(User user) {

        return new UserResponse(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole()
        );
    }
}