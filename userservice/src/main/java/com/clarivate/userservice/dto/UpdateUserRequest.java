package com.clarivate.userservice.dto;

import com.clarivate.userservice.enums.Role;

public record UpdateUserRequest(

        String firstName,
        String lastName,
        Role role

) {}
