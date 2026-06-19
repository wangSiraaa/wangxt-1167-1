package com.auction.deposit.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class DepositPayDTO {

    @NotNull(message = "标的ID不能为空")
    private Long itemId;

    @NotNull(message = "竞买人ID不能为空")
    private Long bidderId;

    @NotBlank(message = "支付方式不能为空")
    private String payMethod;

    @NotBlank(message = "支付订单号不能为空")
    private String payOrderNo;
}
