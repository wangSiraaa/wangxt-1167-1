package com.auction.deposit.service;

import com.auction.deposit.common.PageResult;
import com.auction.deposit.entity.AuctionDeposit;

import java.math.BigDecimal;
import java.util.List;

public interface DepositService {

    PageResult<AuctionDeposit> getDepositList(PageResult<AuctionDeposit> page, AuctionDeposit deposit);

    AuctionDeposit getDepositById(Long id);

    AuctionDeposit getDepositByNo(String depositNo);

    List<AuctionDeposit> getMyDepositList(Long bidderId);

    AuctionDeposit payDeposit(Long itemId, Long bidderId, String payMethod, String payOrderNo);

    void updateBankAccount(Long depositId, Long userId, String bankAccount, String bankName, String bankBranch);

    BigDecimal getRefundableAmount(Long depositId);
}
