package com.auction.deposit.service;

import com.auction.deposit.common.PageResult;
import com.auction.deposit.dto.LoginRequest;
import com.auction.deposit.dto.LoginResponse;
import com.auction.deposit.entity.SysUser;

public interface SysUserService {

    LoginResponse login(LoginRequest request);

    SysUser getUserInfo(Long userId);

    PageResult<SysUser> getUserList(PageResult<SysUser> page, SysUser user);

    void addUser(SysUser user);

    void updateUser(SysUser user);

    void deleteUser(Long id);

    void updateBankAccount(Long userId, SysUser user);
}
