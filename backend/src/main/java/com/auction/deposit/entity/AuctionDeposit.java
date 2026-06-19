package com.auction.deposit.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("auction_deposit")
public class AuctionDeposit {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String depositNo;

    private Long itemId;

    private Long bidderId;

    private BigDecimal depositAmount;

    private String payStatus;

    private LocalDateTime payTime;

    private String payMethod;

    private String payOrderNo;

    private String bidStatus;

    private String refundStatus;

    private String deductStatus;

    private BigDecimal deductAmount;

    private BigDecimal refundableAmount;

    private LocalDateTime refundTime;

    private Integer bankAccountEditable;

    private String bankAccount;

    private String bankName;

    private String bankBranch;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
