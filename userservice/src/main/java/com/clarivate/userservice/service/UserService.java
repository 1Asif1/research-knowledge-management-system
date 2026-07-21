package com.clarivate.userservice.service;

import com.clarivate.userservice.dto.UpdateUserRequest;
import com.clarivate.userservice.dto.UserRequest;
import com.clarivate.userservice.dto.UserResponse;
import com.clarivate.userservice.exception.ResourceNotFoundException;
import com.clarivate.userservice.model.User;
import org.springframework.stereotype.Service;

import java.util.List;

public interface UserService {

    UserResponse createUser(UserRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id) throws ResourceNotFoundException;

    UserResponse getUserByEmail(String email) throws ResourceNotFoundException;

    UserResponse updateUser(Long id, UpdateUserRequest request) throws ResourceNotFoundException;

    void deleteUser(Long id) throws ResourceNotFoundException;
}