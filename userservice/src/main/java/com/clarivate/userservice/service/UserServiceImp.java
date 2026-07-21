package com.clarivate.userservice.service;

import com.clarivate.userservice.dto.UpdateUserRequest;
import com.clarivate.userservice.dto.UserRequest;
import com.clarivate.userservice.dto.UserResponse;
import com.clarivate.userservice.exception.ResourceNotFoundException;
import com.clarivate.userservice.model.User;
import com.clarivate.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImp implements UserService {

    private final UserRepository repo;

    @Override
    public UserResponse createUser(UserRequest request) {

        User user = new User();

        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPassword(request.password());   // Later store encoded password
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