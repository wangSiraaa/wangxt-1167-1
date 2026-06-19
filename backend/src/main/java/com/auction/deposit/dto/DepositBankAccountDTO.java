package com.auction.deposit.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class DepositBankAccountDTO {

    @NotNull(message = "保证金ID不能为空")
    private Long depositId;

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @NotBlank(message = "银行账号不能为空")
    private String bankAccount;

    @NotBlank(message = "开户银行不能为空")
    private String bankName;

    @NotBlank(message = "开户支行不能为空")
    private String bankBranch;
}
