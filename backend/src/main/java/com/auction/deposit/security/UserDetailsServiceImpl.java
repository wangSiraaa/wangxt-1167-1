package com.auction.deposit.security;

import com.auction.deposit.entity.SysUser;
import com.auction.deposit.mapper.SysUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        SysUser sysUser = sysUserMapper.selectByUsername(username);
        if (sysUser == null) {
            throw new UsernameNotFoundException("用户不存在: " + username);
        }

        if (sysUser.getStatus() != null && sysUser.getStatus() == 0) {
            throw new UsernameNotFoundException("用户已被禁用: " + username);
        }

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        return new User(
                sysUser.getUsername(),
                sysUser.getPassword(),
                authorities
        );
    }
}
