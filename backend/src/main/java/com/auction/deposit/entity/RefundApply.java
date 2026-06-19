package com.auction.deposit.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("refund_apply")
public class RefundApply {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String refundNo;

    private Long depositId;

    private Long itemId;

    private Long bidderId;

    private BigDecimal refundAmount;

    private String refundType;

    private String refundReason;

    private String bankAccount;

    private String bankName;

    private String bankBranch;

    private String payeeName;

    private String applyStatus;

    private Long applyBy;

    private LocalDateTime applyTime;

    private Long auditorId;

    private LocalDateTime auditTime;

    private String auditRemark;

    private String payOrderNo;

    private LocalDateTime completeTime;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
