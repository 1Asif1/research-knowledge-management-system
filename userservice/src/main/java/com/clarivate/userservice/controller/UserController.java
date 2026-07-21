package com.clarivate.userservice.controller;
import com.clarivate.userservice.dto.UpdateUserRequest;
import com.clarivate.userservice.dto.UserRequest;
import com.clarivate.userservice.dto.UserResponse;
import com.clarivate.userservice.exception.ResourceNotFoundException;
import com.clarivate.userservice.service.UserServiceImp;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserServiceImp service;

    // POST /users
    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody UserRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createUser(request));
    }

    // GET /users
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(service.getAllUsers());
    }

    // GET /users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id) throws ResourceNotFoundException {

        return ResponseEntity.ok(service.getUserById(id));
    }

    // GET /users/email/{email}
    @GetMapping("/email/{email}")

    public ResponseEntity<UserResponse> getUserByEmail(
            @PathVariable String email) throws ResourceNotFoundException {

        return ResponseEntity.ok(service.getUserByEmail(email));
    }

    // PUT /users/{id}
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) throws ResourceNotFoundException {

        return ResponseEntity.ok(service.updateUser(id, request));
    }

    // DELETE /users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id) throws ResourceNotFoundException {

        service.deleteUser(id);

        return ResponseEntity.noContent().build();
    }
}