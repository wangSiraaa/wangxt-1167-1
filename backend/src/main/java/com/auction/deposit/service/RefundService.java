package com.auction.deposit.service;

import com.auction.deposit.common.PageResult;
import com.auction.deposit.entity.RefundApply;

import java.util.List;

public interface RefundService {

    PageResult<RefundApply> getRefundList(PageResult<RefundApply> page, RefundApply refund);

    RefundApply getRefundById(Long id);

    RefundApply getRefundByNo(String refundNo);

    RefundApply applyRefund(Long depositId, Long applyBy, RefundApply refund);

    void auditRefund(Long refundId, Long auditorId, Boolean pass, String auditRemark);

    void completeRefund(Long refundId, String payOrderNo);

    List<RefundApply> getRefundByDepositId(Long depositId);

    List<RefundApply> getMyRefund(Long bidderId);
}
