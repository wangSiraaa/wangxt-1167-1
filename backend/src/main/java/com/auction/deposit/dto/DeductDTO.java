package com.auction.deposit.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DeductDTO {

    private Long depositId;

    private BigDecimal deductAmount;

    private String deductType;

    private String deductReason;

    private String remark;
}
