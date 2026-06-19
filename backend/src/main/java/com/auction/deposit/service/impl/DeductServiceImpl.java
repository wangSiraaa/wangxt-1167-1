package com.auction.deposit.service.impl;

import com.auction.deposit.common.BusinessException;
import com.auction.deposit.common.CurrentUser;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.entity.AuctionDeposit;
import com.auction.deposit.entity.DeductRecord;
import com.auction.deposit.mapper.AuctionDepositMapper;
import com.auction.deposit.mapper.DeductRecordMapper;
import com.auction.deposit.service.AuditLogService;
import com.auction.deposit.service.DeductService;
import com.auction.deposit.service.FundFlowService;
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

@Service
public class DeductServiceImpl implements DeductService {

    @Autowired
    private DeductRecordMapper deductRecordMapper;

    @Autowired
    private AuctionDepositMapper auctionDepositMapper;

    @Autowired
    private FundFlowService fundFlowService;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    public PageResult<DeductRecord> getDeductList(PageResult<DeductRecord> page, DeductRecord record) {
        IPage<DeductRecord> pageParam = new Page<>(page.getCurrent(), page.getSize());
        LambdaQueryWrapper<DeductRecord> wrapper = new LambdaQueryWrapper<>();

        if (record.getDeductNo() != null && !record.getDeductNo().isEmpty()) {
            wrapper.like(DeductRecord::getDeductNo, record.getDeductNo());
        }
        if (record.getDepositId() != null) {
            wrapper.eq(DeductRecord::getDepositId, record.getDepositId());
        }
        if (record.getItemId() != null) {
            wrapper.eq(DeductRecord::getItemId, record.getItemId());
        }
        if (record.getBidderId() != null) {
            wrapper.eq(DeductRecord::getBidderId, record.getBidderId());
        }
        if (record.getDeductType() != null && !record.getDeductType().isEmpty()) {
            wrapper.eq(DeductRecord::getDeductType, record.getDeductType());
        }
        if (record.getOperatorId() != null) {
            wrapper.eq(DeductRecord::getOperatorId, record.getOperatorId());
        }
        wrapper.orderByDesc(DeductRecord::getCreateTime);

        IPage<DeductRecord> result = deductRecordMapper.selectPage(pageParam, wrapper);
        return PageResult.of(result.getTotal(), result.getPages(), result.getCurrent(), result.getSize(), result.getRecords());
    }

    @Override
    public DeductRecord getDeductById(Long id) {
        return deductRecordMapper.selectById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deductDeposit(Long depositId, Long operatorId, DeductRecord record) {
        AuctionDeposit deposit = auctionDepositMapper.selectById(depositId);
        if (deposit == null) {
            throw new BusinessException("保证金记录不存在");
        }

        if (!"paid".equals(deposit.getPayStatus())) {
            throw new BusinessException("保证金未缴纳，无法抵扣");
        }

        BigDecimal depositAmount = deposit.getDepositAmount() != null ? deposit.getDepositAmount() : BigDecimal.ZERO;
        BigDecimal alreadyDeduct = deposit.getDeductAmount() != null ? deposit.getDeductAmount() : BigDecimal.ZERO;
        BigDecimal deductibleAmount = depositAmount.subtract(alreadyDeduct);

        if (deductibleAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("可抵扣金额不足");
        }

        if (record.getDeductAmount() == null || record.getDeductAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("抵扣金额必须大于0");
        }

        if (record.getDeductAmount().compareTo(deductibleAmount) > 0) {
            throw new BusinessException("抵扣金额不能超过可抵扣金额：" + deductibleAmount);
        }

        String beforeDeductStatus = deposit.getDeductStatus();

        BigDecimal newDeductAmount = alreadyDeduct.add(record.getDeductAmount());
        deposit.setDeductAmount(newDeductAmount);

        BigDecimal newRefundableAmount = depositAmount.subtract(newDeductAmount);
        deposit.setRefundableAmount(newRefundableAmount);

        if (newDeductAmount.compareTo(depositAmount) >= 0) {
            deposit.setDeductStatus("deducted");
        } else {
            deposit.setDeductStatus("partial_deducted");
        }
        deposit.setUpdateTime(LocalDateTime.now());
        auctionDepositMapper.updateById(deposit);

        record.setDeductNo(generateDeductNo());
        record.setDepositId(depositId);
        record.setItemId(deposit.getItemId());
        record.setBidderId(deposit.getBidderId());
        record.setOperatorId(operatorId);
        record.setOperateTime(LocalDateTime.now());
        record.setCreateTime(LocalDateTime.now());
        if (record.getDeductType() == null || record.getDeductType().isEmpty()) {
            record.setDeductType("tail_payment");
        }
        deductRecordMapper.insert(record);

        fundFlowService.createDepositDeductFlow(record.getId(), record.getDeductAmount(), deposit.getBidderId());

        auditLogService.logAudit("DEDUCT", record.getId(), record.getDeductNo(),
                "DEDUCT", "保证金抵扣", beforeDeductStatus, deposit.getDeductStatus(),
                "抵扣金额：" + record.getDeductAmount() + "，抵扣原因：" + record.getDeductReason());
    }

    private String generateDeductNo() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "DK" + dateStr;

        LambdaQueryWrapper<DeductRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(DeductRecord::getDeductNo, prefix);
        wrapper.orderByDesc(DeductRecord::getDeductNo);
        wrapper.last("LIMIT 1");
        DeductRecord lastDeduct = deductRecordMapper.selectOne(wrapper);

        int sequence = 1;
        if (lastDeduct != null && lastDeduct.getDeductNo() != null) {
            String lastNo = lastDeduct.getDeductNo();
            String seqStr = lastNo.substring(prefix.length());
            try {
                sequence = Integer.parseInt(seqStr) + 1;
            } catch (NumberFormatException e) {
                sequence = 1;
            }
        }

        if (sequence > 999) {
            sequence = 1;
        }

        return prefix + String.format("%03d", sequence);
    }
}
