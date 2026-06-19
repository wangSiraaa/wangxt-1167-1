package com.auction.deposit.service;

import com.auction.deposit.common.PageResult;
import com.auction.deposit.dto.FundChainDTO;
import com.auction.deposit.entity.FundFlow;

import java.math.BigDecimal;
import java.util.List;

public interface FundFlowService {

    PageResult<FundFlow> getFlowList(PageResult<FundFlow> page, FundFlow flow);

    FundFlow getFlowById(Long id);

    FundFlow getFlowByNo(String flowNo);

    FundFlow createFlow(FundFlow flow);

    void createDepositPayFlow(Long depositId, BigDecimal amount, String payMethod, String payOrderNo, Long userId);

    void createDepositRefundFlow(Long refundId, BigDecimal amount, String payOrderNo, Long userId);

    void createDepositDeductFlow(Long deductId, BigDecimal amount, Long userId);

    FundChainDTO getFundChain(Long depositId);

    List<FundChainDTO> getFundChainByItemId(Long itemId);
}
