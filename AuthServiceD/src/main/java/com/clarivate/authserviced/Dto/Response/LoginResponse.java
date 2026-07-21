package com.clarivate.authserviced.Dto.Response;

import com.clarivate.authserviced.Entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private long uuid;
    private String firstname;
    private String lastname;
    private String email;
    private Role role;
    private String message;
}
