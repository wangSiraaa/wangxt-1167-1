package com.auction.deposit.dto;

public class LoginResponse {

    private String token;

    private String tokenPrefix;

    private Long expiresIn;

    private String username;

    private String realName;

    public LoginResponse() {
    }

    public LoginResponse(String token, String tokenPrefix, Long expiresIn, String username, String realName) {
        this.token = token;
        this.tokenPrefix = tokenPrefix;
        this.expiresIn = expiresIn;
        this.username = username;
        this.realName = realName;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenPrefix() {
        return tokenPrefix;
    }

    public void setTokenPrefix(String tokenPrefix) {
        this.tokenPrefix = tokenPrefix;
    }

    public Long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRealName() {
        return realName;
    }

    public void setRealName(String realName) {
        this.realName = realName;
    }
}
