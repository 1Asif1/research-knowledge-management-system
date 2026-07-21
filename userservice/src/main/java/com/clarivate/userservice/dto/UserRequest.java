package com.clarivate.userservice.dto;

import com.clarivate.userservice.enums.Role;
import jakarta.validation.constraints.*;

public record UserRequest(

        @NotBlank
        String firstName,

        @NotBlank
        String lastName,

        @Email
        String email,

        @NotBlank
        String password,

        @NotNull
        Role role

) {}
