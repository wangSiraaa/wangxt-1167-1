package com.auction.deposit.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("audit_log")
public class AuditLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String bizType;

    private Long bizId;

    private String bizNo;

    private String operateType;

    private String operateDesc;

    private String beforeStatus;

    private String afterStatus;

    private Long operatorId;

    private String operatorName;

    private String operatorRole;

    private String ipAddress;

    private String remark;

    private LocalDateTime createTime;
}
