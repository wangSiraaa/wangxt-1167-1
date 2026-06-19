package com.auction.deposit.service.impl;

import com.auction.deposit.common.BusinessException;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.entity.AuctionDeposit;
import com.auction.deposit.entity.AuctionItem;
import com.auction.deposit.entity.RefundApply;
import com.auction.deposit.mapper.AuctionDepositMapper;
import com.auction.deposit.mapper.AuctionItemMapper;
import com.auction.deposit.mapper.RefundApplyMapper;
import com.auction.deposit.service.AuditLogService;
import com.auction.deposit.service.FundFlowService;
import com.auction.deposit.service.RefundService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class RefundServiceImpl implements RefundService {

    @Autowired
    private RefundApplyMapper refundApplyMapper;

    @Autowired
    private AuctionDepositMapper auctionDepositMapper;

    @Autowired
    private AuctionItemMapper auctionItemMapper;

    @Autowired
    private FundFlowService fundFlowService;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    public PageResult<RefundApply> getRefundList(PageResult<RefundApply> page, RefundApply refund) {
        IPage<RefundApply> pageParam = new Page<>(page.getCurrent(), page.getSize());
        LambdaQueryWrapper<RefundApply> wrapper = new LambdaQueryWrapper<>();

        if (refund.getDepositId() != null) {
            wrapper.eq(RefundApply::getDepositId, refund.getDepositId());
        }
        if (refund.getBidderId() != null) {
            wrapper.eq(RefundApply::getBidderId, refund.getBidderId());
        }
        if (refund.getApplyStatus() != null) {
            wrapper.eq(RefundApply::getApplyStatus, refund.getApplyStatus());
        }
        if (refund.getRefundNo() != null) {
            wrapper.like(RefundApply::getRefundNo, refund.getRefundNo());
        }
        wrapper.orderByDesc(RefundApply::getApplyTime);

        IPage<RefundApply> result = refundApplyMapper.selectPage(pageParam, wrapper);
        return PageResult.of(result.getTotal(), result.getPages(), result.getCurrent(), result.getSize(), result.getRecords());
    }

    @Override
    public RefundApply getRefundById(Long id) {
        return refundApplyMapper.selectById(id);
    }

    @Override
    public RefundApply getRefundByNo(String refundNo) {
        return refundApplyMapper.selectByRefundNo(refundNo);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RefundApply applyRefund(Long depositId, Long applyBy, RefundApply refund) {
        AuctionDeposit deposit = auctionDepositMapper.selectById(depositId);
        if (deposit == null) {
            throw new BusinessException("保证金记录不存在");
        }

        if (!"paid".equals(deposit.getPayStatus())) {
            throw new BusinessException("保证金未缴纳，不能申请退款");
        }

        if ("refunding".equals(deposit.getRefundStatus()) || "refunded".equals(deposit.getRefundStatus())) {
            throw new BusinessException("该保证金已在退款流程中或已退款完成");
        }

        BigDecimal refundableAmount = deposit.getDepositAmount();
        if (deposit.getDeductAmount() != null) {
            refundableAmount = refundableAmount.subtract(deposit.getDeductAmount());
        }
        if (refundableAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("可退款金额为零，不能申请退款");
        }

        if ("won".equals(deposit.getBidStatus())) {
            AuctionItem item = auctionItemMapper.selectById(deposit.getItemId());
            if (item == null || !"paid".equals(item.getTailPaidStatus())) {
                throw new BusinessException("竞得人未付清尾款，不能申请退款");
            }
        }

        if ("lost".equals(deposit.getBidStatus())) {
            if (refund.getBankAccount() == null || refund.getBankAccount().trim().isEmpty()) {
                throw new BusinessException("银行账号不能为空");
            }
            if (refund.getBankName() == null || refund.getBankName().trim().isEmpty()) {
                throw new BusinessException("银行名称不能为空");
            }
            if (refund.getBankBranch() == null || refund.getBankBranch().trim().isEmpty()) {
                throw new BusinessException("银行支行不能为空");
            }
        }

        String refundNo = generateRefundNo();

        RefundApply refundApply = new RefundApply();
        refundApply.setRefundNo(refundNo);
        refundApply.setDepositId(depositId);
        refundApply.setItemId(deposit.getItemId());
        refundApply.setBidderId(deposit.getBidderId());
        refundApply.setRefundAmount(refundableAmount);
        refundApply.setRefundType(refund.getRefundType());
        refundApply.setRefundReason(refund.getRefundReason());
        refundApply.setBankAccount(refund.getBankAccount());
        refundApply.setBankName(refund.getBankName());
        refundApply.setBankBranch(refund.getBankBranch());
        refundApply.setPayeeName(refund.getPayeeName());
        refundApply.setApplyStatus("pending");
        refundApply.setApplyBy(applyBy);
        refundApply.setApplyTime(LocalDateTime.now());
        refundApply.setRemark(refund.getRemark());
        refundApply.setCreateTime(LocalDateTime.now());
        refundApply.setUpdateTime(LocalDateTime.now());
        refundApplyMapper.insert(refundApply);

        deposit.setRefundStatus("refunding");
        deposit.setBankAccountEditable(0);
        deposit.setUpdateTime(LocalDateTime.now());
        auctionDepositMapper.updateById(deposit);

        auditLogService.logAudit("REFUND_APPLY", refundApply.getId(), refundNo,
                "APPLY", "发起退款申请", null, "pending",
                "保证金ID：" + depositId + "，退款金额：" + refundableAmount);

        return refundApply;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void auditRefund(Long refundId, Long auditorId, Boolean pass, String auditRemark) {
        RefundApply refundApply = refundApplyMapper.selectById(refundId);
        if (refundApply == null) {
            throw new BusinessException("退款申请不存在");
        }

        if (!"pending".equals(refundApply.getApplyStatus())) {
            throw new BusinessException("退款申请状态不正确，不能审核");
        }

        String beforeStatus = refundApply.getApplyStatus();
        String afterStatus = pass ? "processing" : "rejected";

        refundApply.setApplyStatus(afterStatus);
        refundApply.setAuditorId(auditorId);
        refundApply.setAuditTime(LocalDateTime.now());
        refundApply.setAuditRemark(auditRemark);
        refundApply.setUpdateTime(LocalDateTime.now());
        refundApplyMapper.updateById(refundApply);

        if (!pass) {
            AuctionDeposit deposit = auctionDepositMapper.selectById(refundApply.getDepositId());
            if (deposit != null) {
                deposit.setRefundStatus("norefund");
                deposit.setBankAccountEditable(1);
                deposit.setUpdateTime(LocalDateTime.now());
                auctionDepositMapper.updateById(deposit);
            }
        }

        String operateDesc = pass ? "审核通过" : "审核拒绝";
        auditLogService.logAudit("REFUND_APPLY", refundId, refundApply.getRefundNo(),
                "AUDIT", operateDesc, beforeStatus, afterStatus, auditRemark);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void completeRefund(Long refundId, String payOrderNo) {
        RefundApply refundApply = refundApplyMapper.selectById(refundId);
        if (refundApply == null) {
            throw new BusinessException("退款申请不存在");
        }

        if (!"processing".equals(refundApply.getApplyStatus())) {
            throw new BusinessException("退款申请状态不正确，不能确认完成");
        }

        String beforeStatus = refundApply.getApplyStatus();

        refundApply.setApplyStatus("completed");
        refundApply.setPayOrderNo(payOrderNo);
        refundApply.setCompleteTime(LocalDateTime.now());
        refundApply.setUpdateTime(LocalDateTime.now());
        refundApplyMapper.updateById(refundApply);

        AuctionDeposit deposit = auctionDepositMapper.selectById(refundApply.getDepositId());
        if (deposit != null) {
            deposit.setRefundStatus("refunded");
            deposit.setRefundTime(LocalDateTime.now());
            deposit.setUpdateTime(LocalDateTime.now());
            auctionDepositMapper.updateById(deposit);
        }

        fundFlowService.createDepositRefundFlow(refundId, refundApply.getRefundAmount(), payOrderNo, refundApply.getBidderId());

        auditLogService.logAudit("REFUND_APPLY", refundId, refundApply.getRefundNo(),
                "COMPLETE", "确认退款完成", beforeStatus, "completed",
                "支付订单号：" + payOrderNo);
    }

    @Override
    public List<RefundApply> getRefundByDepositId(Long depositId) {
        return refundApplyMapper.selectByDepositId(depositId);
    }

    @Override
    public List<RefundApply> getMyRefund(Long bidderId) {
        LambdaQueryWrapper<RefundApply> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RefundApply::getBidderId, bidderId);
        wrapper.orderByDesc(RefundApply::getApplyTime);
        return refundApplyMapper.selectList(wrapper);
    }

    private String generateRefundNo() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "TK" + dateStr;

        LambdaQueryWrapper<RefundApply> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(RefundApply::getRefundNo, prefix);
        wrapper.orderByDesc(RefundApply::getRefundNo);
        wrapper.last("limit 1");
        RefundApply lastRefund = refundApplyMapper.selectOne(wrapper);

        int sequence = 1;
        if (lastRefund != null && lastRefund.getRefundNo() != null) {
            String lastNo = lastRefund.getRefundNo();
            String seqStr = lastNo.substring(prefix.length());
            try {
                sequence = Integer.parseInt(seqStr) + 1;
            } catch (NumberFormatException e) {
                sequence = 1;
            }
        }

        return prefix + String.format("%03d", sequence);
    }
}
