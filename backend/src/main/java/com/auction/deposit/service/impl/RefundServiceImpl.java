package com.auction.deposit.service.impl;

import com.auction.deposit.common.BusinessException;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.entity.AuctionDeposit;
import com.auction.deposit.entity.AuctionItem;
import com.auction.deposit.entity.RefundApply;
import com.auction.deposit.entity.SysUser;
import com.auction.deposit.mapper.AuctionDepositMapper;
import com.auction.deposit.mapper.AuctionItemMapper;
import com.auction.deposit.mapper.RefundApplyMapper;
import com.auction.deposit.mapper.SysUserMapper;
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
    private SysUserMapper sysUserMapper;

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

        if ("pending_deduct".equals(deposit.getDeductStatus())) {
            throw new BusinessException("竞得人保证金待抵扣尾款，不能申请退款");
        }

        if ("won".equals(deposit.getBidStatus())) {
            AuctionItem item = auctionItemMapper.selectById(deposit.getItemId());
            if (item == null || !"paid".equals(item.getTailPaidStatus())) {
                throw new BusinessException("竞得人未付清尾款，不能申请退款");
            }
        }

        if (!"won".equals(deposit.getBidStatus())) {
            SysUser bidder = sysUserMapper.selectById(deposit.getBidderId());
            if (bidder == null) {
                throw new BusinessException("竞买人信息不存在");
            }
            if (bidder.getJudicialFrozen() != null && bidder.getJudicialFrozen() == 1) {
                String frozenReason = bidder.getFrozenReason() != null ? bidder.getFrozenReason() : "账户已被司法冻结";
                throw new BusinessException(frozenReason + "，不能申请退款");
            }
            if (refund.getBankAccount() == null || refund.getBankAccount().trim().isEmpty()) {
                throw new BusinessException("收款银行账号不能为空，请完善账户信息");
            }
            if (refund.getBankName() == null || refund.getBankName().trim().isEmpty()) {
                throw new BusinessException("开户银行不能为空，请完善账户信息");
            }
            if (refund.getBankBranch() == null || refund.getBankBranch().trim().isEmpty()) {
                throw new BusinessException("开户支行不能为空，请完善账户信息");
            }
            if (refund.getPayeeName() == null || refund.getPayeeName().trim().isEmpty()) {
                throw new BusinessException("收款人姓名不能为空，请完善账户信息");
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
        deposit.setBankAccountLockTime(LocalDateTime.now());
        deposit.setBankAccountLockBy(applyBy);
        deposit.setBankAccount(refund.getBankAccount());
        deposit.setBankName(refund.getBankName());
        deposit.setBankBranch(refund.getBankBranch());
        deposit.setPayeeName(refund.getPayeeName());
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
                deposit.setBankAccountLockTime(null);
                deposit.setBankAccountLockBy(null);
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
    @Transactional(rollbackFor = Exception.class)
    public void failRefund(Long refundId, String failReason) {
        RefundApply refundApply = refundApplyMapper.selectById(refundId);
        if (refundApply == null) {
            throw new BusinessException("退款申请不存在");
        }
        if (!"processing".equals(refundApply.getApplyStatus())) {
            throw new BusinessException("退款申请状态不正确，仅处理中状态可标记失败");
        }
        String beforeStatus = refundApply.getApplyStatus();
        refundApply.setApplyStatus("failed");
        refundApply.setFailReason(failReason);
        refundApply.setUpdateTime(LocalDateTime.now());
        refundApplyMapper.updateById(refundApply);

        AuctionDeposit deposit = auctionDepositMapper.selectById(refundApply.getDepositId());
        if (deposit != null) {
            deposit.setRefundStatus("refund_failed");
            deposit.setUpdateTime(LocalDateTime.now());
            auctionDepositMapper.updateById(deposit);
        }

        auditLogService.logAudit("REFUND_APPLY", refundId, refundApply.getRefundNo(),
                "FAIL", "标记退款失败", beforeStatus, "failed",
                "失败原因：" + failReason);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public RefundApply reapplyRefund(Long originalRefundId, Long applyBy, RefundApply refund) {
        RefundApply originalRefund = refundApplyMapper.selectById(originalRefundId);
        if (originalRefund == null) {
            throw new BusinessException("原退款申请不存在");
        }
        if (!"failed".equals(originalRefund.getApplyStatus())) {
            throw new BusinessException("仅失败状态的退款申请可重提");
        }

        AuctionDeposit deposit = auctionDepositMapper.selectById(originalRefund.getDepositId());
        if (deposit == null) {
            throw new BusinessException("保证金记录不存在");
        }

        SysUser bidder = sysUserMapper.selectById(deposit.getBidderId());
        if (bidder != null && bidder.getJudicialFrozen() != null && bidder.getJudicialFrozen() == 1) {
            String frozenReason = bidder.getFrozenReason() != null ? bidder.getFrozenReason() : "账户已被司法冻结";
            throw new BusinessException(frozenReason + "，不能重提退款");
        }

        String bankAccount = (refund.getBankAccount() != null && !refund.getBankAccount().trim().isEmpty())
                ? refund.getBankAccount() : originalRefund.getBankAccount();
        String bankName = (refund.getBankName() != null && !refund.getBankName().trim().isEmpty())
                ? refund.getBankName() : originalRefund.getBankName();
        String bankBranch = (refund.getBankBranch() != null && !refund.getBankBranch().trim().isEmpty())
                ? refund.getBankBranch() : originalRefund.getBankBranch();
        String payeeName = (refund.getPayeeName() != null && !refund.getPayeeName().trim().isEmpty())
                ? refund.getPayeeName() : originalRefund.getPayeeName();

        if (bankAccount == null || bankAccount.trim().isEmpty()) {
            throw new BusinessException("收款银行账号不能为空");
        }
        if (bankName == null || bankName.trim().isEmpty()) {
            throw new BusinessException("开户银行不能为空");
        }
        if (bankBranch == null || bankBranch.trim().isEmpty()) {
            throw new BusinessException("开户支行不能为空");
        }
        if (payeeName == null || payeeName.trim().isEmpty()) {
            throw new BusinessException("收款人姓名不能为空");
        }

        String refundNo = generateRefundNo();
        RefundApply newRefundApply = new RefundApply();
        newRefundApply.setRefundNo(refundNo);
        newRefundApply.setParentId(originalRefundId);
        newRefundApply.setDepositId(originalRefund.getDepositId());
        newRefundApply.setItemId(originalRefund.getItemId());
        newRefundApply.setBidderId(originalRefund.getBidderId());
        newRefundApply.setRefundAmount(originalRefund.getRefundAmount());
        newRefundApply.setRefundType(originalRefund.getRefundType());
        newRefundApply.setRefundReason(refund.getRefundReason() != null ? refund.getRefundReason() : "退款失败后重提");
        newRefundApply.setBankAccount(bankAccount);
        newRefundApply.setBankName(bankName);
        newRefundApply.setBankBranch(bankBranch);
        newRefundApply.setPayeeName(payeeName);
        newRefundApply.setApplyStatus("pending");
        newRefundApply.setApplyBy(applyBy);
        newRefundApply.setApplyTime(LocalDateTime.now());
        newRefundApply.setRemark("重提原申请：" + originalRefund.getRefundNo() + "；" + (refund.getRemark() != null ? refund.getRemark() : ""));
        newRefundApply.setCreateTime(LocalDateTime.now());
        newRefundApply.setUpdateTime(LocalDateTime.now());
        refundApplyMapper.insert(newRefundApply);

        deposit.setRefundStatus("refunding");
        deposit.setBankAccountEditable(0);
        deposit.setBankAccountLockTime(LocalDateTime.now());
        deposit.setBankAccountLockBy(applyBy);
        deposit.setBankAccount(bankAccount);
        deposit.setBankName(bankName);
        deposit.setBankBranch(bankBranch);
        deposit.setPayeeName(payeeName);
        deposit.setUpdateTime(LocalDateTime.now());
        auctionDepositMapper.updateById(deposit);

        auditLogService.logAudit("REFUND_APPLY", newRefundApply.getId(), refundNo,
                "REAPPLY", "重提退款申请", null, "pending",
                "原退款申请ID：" + originalRefundId + "，退款金额：" + originalRefund.getRefundAmount());

        return newRefundApply;
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
