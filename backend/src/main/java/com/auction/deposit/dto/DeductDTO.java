package com.auction.deposit.dto;

import java.math.BigDecimal;

public class DeductDTO {

    private Long depositId;

    private BigDecimal deductAmount;

    private String deductType;

    private String deductReason;

    private String remark;

    public Long getDepositId() {
        return depositId;
    }

    public void setDepositId(Long depositId) {
        this.depositId = depositId;
    }

    public BigDecimal getDeductAmount() {
        return deductAmount;
    }

    public void setDeductAmount(BigDecimal deductAmount) {
        this.deductAmount = deductAmount;
    }

    public String getDeductType() {
        return deductType;
    }

    public void setDeductType(String deductType) {
        this.deductType = deductType;
    }

    public String getDeductReason() {
        return deductReason;
    }

    public void setDeductReason(String deductReason) {
        this.deductReason = deductReason;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }
}
