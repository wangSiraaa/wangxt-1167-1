package com.auction.deposit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String token;

    private String tokenPrefix;

    private Long expiresIn;

    private String username;

    private String realName;
}
