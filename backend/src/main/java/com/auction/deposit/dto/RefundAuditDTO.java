package com.auction.deposit.dto;

import lombok.Data;

@Data
public class RefundAuditDTO {

    private Long refundId;

    private Boolean pass;

    private String auditRemark;
}
