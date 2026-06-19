package com.auction.deposit.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class DepositPayDTO {

    @NotNull(message = "标的ID不能为空")
    private Long itemId;

    @NotNull(message = "竞买人ID不能为空")
    private Long bidderId;

    @NotBlank(message = "支付方式不能为空")
    private String payMethod;

    @NotBlank(message = "支付订单号不能为空")
    private String payOrderNo;

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public Long getBidderId() {
        return bidderId;
    }

    public void setBidderId(Long bidderId) {
        this.bidderId = bidderId;
    }

    public String getPayMethod() {
        return payMethod;
    }

    public void setPayMethod(String payMethod) {
        this.payMethod = payMethod;
    }

    public String getPayOrderNo() {
        return payOrderNo;
    }

    public void setPayOrderNo(String payOrderNo) {
        this.payOrderNo = payOrderNo;
    }
}
