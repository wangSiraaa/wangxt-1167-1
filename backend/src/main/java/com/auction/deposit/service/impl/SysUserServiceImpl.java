package com.auction.deposit.service.impl;

import com.auction.deposit.common.BusinessException;
import com.auction.deposit.common.Constants;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.dto.LoginRequest;
import com.auction.deposit.dto.LoginResponse;
import com.auction.deposit.entity.SysPermission;
import com.auction.deposit.entity.SysRole;
import com.auction.deposit.entity.SysUser;
import com.auction.deposit.mapper.SysPermissionMapper;
import com.auction.deposit.mapper.SysRoleMapper;
import com.auction.deposit.mapper.SysUserMapper;
import com.auction.deposit.security.JwtTokenUtil;
import com.auction.deposit.service.AuditLogService;
import com.auction.deposit.service.SysUserService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SysUserServiceImpl implements SysUserService {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SysRoleMapper sysRoleMapper;

    @Autowired
    private SysPermissionMapper sysPermissionMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private AuditLogService auditLogService;

    @Value("${jwt.expiration}")
    private Long expiration;

    @Override
    public LoginResponse login(LoginRequest request) {
        SysUser sysUser = sysUserMapper.selectByUsername(request.getUsername());
        if (sysUser == null) {
            throw new BusinessException("用户名或密码错误");
        }

        if (sysUser.getStatus() != null && sysUser.getStatus() == 0) {
            throw new BusinessException(Constants.FORBIDDEN_CODE, "用户已被禁用");
        }

        if (!passwordEncoder.matches(request.getPassword(), sysUser.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        String token = jwtTokenUtil.generateToken(sysUser.getUsername(), sysUser.getId());

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setTokenPrefix(Constants.TOKEN_PREFIX);
        response.setExpiresIn(expiration / 1000);
        response.setUsername(sysUser.getUsername());
        response.setRealName(sysUser.getRealName());

        auditLogService.logAudit("USER", sysUser.getId(), sysUser.getUsername(),
                "LOGIN", "用户登录", null, null, "用户登录系统");

        return response;
    }

    @Override
    public SysUser getUserInfo(Long userId) {
        SysUser sysUser = sysUserMapper.selectById(userId);
        if (sysUser == null) {
            throw new BusinessException("用户不存在");
        }

        sysUser.setPassword(null);

        List<SysRole> roles = sysRoleMapper.selectRolesByUserId(userId);
        List<SysPermission> permissions = sysPermissionMapper.selectPermissionsByUserId(userId);

        return sysUser;
    }

    @Override
    public PageResult<SysUser> getUserList(PageResult<SysUser> page, SysUser user) {
        IPage<SysUser> pageParam = new Page<>(page.getCurrent(), page.getSize());
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();

        if (user.getUsername() != null && !user.getUsername().isEmpty()) {
            wrapper.like(SysUser::getUsername, user.getUsername());
        }
        if (user.getRealName() != null && !user.getRealName().isEmpty()) {
            wrapper.like(SysUser::getRealName, user.getRealName());
        }
        if (user.getPhone() != null && !user.getPhone().isEmpty()) {
            wrapper.like(SysUser::getPhone, user.getPhone());
        }
        if (user.getStatus() != null) {
            wrapper.eq(SysUser::getStatus, user.getStatus());
        }
        wrapper.orderByDesc(SysUser::getCreateTime);

        IPage<SysUser> result = sysUserMapper.selectPage(pageParam, wrapper);

        List<SysUser> records = result.getRecords();
        if (records != null) {
            for (SysUser sysUser : records) {
                sysUser.setPassword(null);
            }
        }

        return PageResult.of(result.getTotal(), result.getPages(), result.getCurrent(), result.getSize(), records);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addUser(SysUser user) {
        SysUser existUser = sysUserMapper.selectByUsername(user.getUsername());
        if (existUser != null) {
            throw new BusinessException("用户名已存在");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        if (user.getStatus() == null) {
            user.setStatus(1);
        }

        sysUserMapper.insert(user);

        auditLogService.logAudit("USER", user.getId(), user.getUsername(),
                "ADD", "新增用户", null, String.valueOf(user.getStatus()), "新增用户：" + user.getUsername());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateUser(SysUser user) {
        SysUser existUser = sysUserMapper.selectById(user.getId());
        if (existUser == null) {
            throw new BusinessException("用户不存在");
        }

        String beforeStatus = String.valueOf(existUser.getStatus());

        user.setPassword(null);
        user.setUsername(null);
        user.setUpdateTime(LocalDateTime.now());

        sysUserMapper.updateById(user);

        String afterStatus = user.getStatus() != null ? String.valueOf(user.getStatus()) : beforeStatus;
        auditLogService.logAudit("USER", user.getId(), existUser.getUsername(),
                "UPDATE", "更新用户信息", beforeStatus, afterStatus, "更新用户信息");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteUser(Long id) {
        SysUser existUser = sysUserMapper.selectById(id);
        if (existUser == null) {
            throw new BusinessException("用户不存在");
        }

        sysUserMapper.deleteById(id);

        auditLogService.logAudit("USER", id, existUser.getUsername(),
                "DELETE", "删除用户", String.valueOf(existUser.getStatus()), null, "删除用户：" + existUser.getUsername());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateBankAccount(Long userId, SysUser user) {
        SysUser existUser = sysUserMapper.selectById(userId);
        if (existUser == null) {
            throw new BusinessException("用户不存在");
        }

        SysUser updateUser = new SysUser();
        updateUser.setId(userId);
        updateUser.setBankAccount(user.getBankAccount());
        updateUser.setBankName(user.getBankName());
        updateUser.setBankBranch(user.getBankBranch());
        updateUser.setUpdateTime(LocalDateTime.now());

        sysUserMapper.updateById(updateUser);

        auditLogService.logAudit("USER", userId, existUser.getUsername(),
                "UPDATE_BANK", "更新银行账号信息", null, null, "更新银行账号信息");
    }
}
