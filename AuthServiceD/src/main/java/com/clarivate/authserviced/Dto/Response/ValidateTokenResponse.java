package com.clarivate.authserviced.Dto.Response;

import com.clarivate.authserviced.Entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class ValidateTokenResponse {
    private boolean valid;
    private String firstname;
    private String lastname;
    private Role role;
}
