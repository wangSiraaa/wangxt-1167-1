package com.auction.deposit.controller;

import com.auction.deposit.common.CurrentUser;
import com.auction.deposit.common.Result;
import com.auction.deposit.dto.LoginRequest;
import com.auction.deposit.dto.LoginResponse;
import com.auction.deposit.entity.SysUser;
import com.auction.deposit.service.SysUserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Api(tags = "认证管理")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private SysUserService sysUserService;

    @ApiOperation("登录")
    @PostMapping("/login")
    public Result<LoginResponse> login(@Validated @RequestBody LoginRequest request) {
        LoginResponse response = sysUserService.login(request);
        return Result.success(response);
    }

    @ApiOperation("获取当前用户信息")
    @GetMapping("/userinfo")
    public Result<SysUser> getUserInfo() {
        Long userId = CurrentUser.getUserId();
        SysUser user = sysUserService.getUserInfo(userId);
        return Result.success(user);
    }

    @ApiOperation("登出")
    @PostMapping("/logout")
    public Result<Void> logout() {
        CurrentUser.clear();
        return Result.success();
    }
}
