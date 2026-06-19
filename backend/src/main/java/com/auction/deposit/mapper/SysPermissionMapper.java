package com.auction.deposit.mapper;

import com.auction.deposit.entity.SysPermission;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SysPermissionMapper extends BaseMapper<SysPermission> {

    List<SysPermission> selectPermissionsByUserId(@Param("userId") Long userId);

    List<SysPermission> selectPermissionsByRoleId(@Param("roleId") Long roleId);
}
