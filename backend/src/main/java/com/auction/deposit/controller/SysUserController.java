package com.auction.deposit.controller;

import com.auction.deposit.common.Constants;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.common.Result;
import com.auction.deposit.entity.SysUser;
import com.auction.deposit.service.SysUserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Api(tags = "用户管理")
@RestController
@RequestMapping("/system/user")
public class SysUserController {

    @Autowired
    private SysUserService sysUserService;

    @ApiOperation("分页查询用户列表")
    @GetMapping("/list")
    public Result<PageResult<SysUser>> getUserList(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_NUM) Long current,
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_SIZE) Long size,
            SysUser user) {
        PageResult<SysUser> page = new PageResult<>();
        page.setCurrent(current);
        page.setSize(size);
        PageResult<SysUser> result = sysUserService.getUserList(page, user);
        return Result.success(result);
    }

    @ApiOperation("查询用户详情")
    @GetMapping("/{id}")
    public Result<SysUser> getUserById(@PathVariable Long id) {
        SysUser user = sysUserService.getUserInfo(id);
        return Result.success(user);
    }

    @ApiOperation("新增用户")
    @PostMapping
    public Result<Void> addUser(@RequestBody SysUser user) {
        sysUserService.addUser(user);
        return Result.success();
    }

    @ApiOperation("更新用户")
    @PutMapping
    public Result<Void> updateUser(@RequestBody SysUser user) {
        sysUserService.updateUser(user);
        return Result.success();
    }

    @ApiOperation("删除用户")
    @DeleteMapping("/{id}")
    public Result<Void> deleteUser(@PathVariable Long id) {
        sysUserService.deleteUser(id);
        return Result.success();
    }

    @ApiOperation("更新银行账号（竞买人）")
    @PutMapping("/bankAccount")
    public Result<Void> updateBankAccount(@RequestBody SysUser user) {
        Long userId = user.getId();
        sysUserService.updateBankAccount(userId, user);
        return Result.success();
    }
}
