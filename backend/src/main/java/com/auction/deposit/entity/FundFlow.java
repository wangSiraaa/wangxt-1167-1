package com.auction.deposit.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("fund_flow")
public class FundFlow {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String flowNo;

    private String flowType;

    private BigDecimal amount;

    private String direction;

    private String relateType;

    private Long relateId;

    private Long itemId;

    private Long userId;

    private String payMethod;

    private String payOrderNo;

    private String flowStatus;

    private String remark;

    private Long operatorId;

    private LocalDateTime createTime;
}
