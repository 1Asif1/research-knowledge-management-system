package com.clarivate.authserviced.Security;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor

public class UserPrincipal {
    private long userId;
    private String userName;
    private String email;
    private String role;
}
