package com.clarivate.userservice.dto;

import com.clarivate.userservice.enums.Role;

public record UserLoginResponse(
        Long uuid,
        String firstname,
        String lastname,
        String email,
        String password,
        Role role,
        String status
) {}
