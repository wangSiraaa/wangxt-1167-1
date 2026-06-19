package com.auction.deposit.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RefundApplyDTO {

    private Long depositId;

    private String refundType;

    private String refundReason;

    private String bankAccount;

    private String bankName;

    private String bankBranch;

    private String payeeName;

    private String remark;
}
