package com.auction.deposit.service.impl;

import com.auction.deposit.common.BusinessException;
import com.auction.deposit.common.CurrentUser;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.entity.AuctionDeposit;
import com.auction.deposit.entity.AuctionItem;
import com.auction.deposit.mapper.AuctionDepositMapper;
import com.auction.deposit.mapper.AuctionItemMapper;
import com.auction.deposit.service.AuditLogService;
import com.auction.deposit.service.DepositService;
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
import java.util.List;
import java.util.Random;

@Service
public class DepositServiceImpl implements DepositService {

    @Autowired
    private AuctionDepositMapper auctionDepositMapper;

    @Autowired
    private AuctionItemMapper auctionItemMapper;

    @Autowired
    private FundFlowService fundFlowService;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    public PageResult<AuctionDeposit> getDepositList(PageResult<AuctionDeposit> page, AuctionDeposit deposit) {
        IPage<AuctionDeposit> pageParam = new Page<>(page.getCurrent(), page.getSize());
        LambdaQueryWrapper<AuctionDeposit> wrapper = new LambdaQueryWrapper<>();

        if (deposit.getDepositNo() != null && !deposit.getDepositNo().isEmpty()) {
            wrapper.like(AuctionDeposit::getDepositNo, deposit.getDepositNo());
        }
        if (deposit.getItemId() != null) {
            wrapper.eq(AuctionDeposit::getItemId, deposit.getItemId());
        }
        if (deposit.getBidderId() != null) {
            wrapper.eq(AuctionDeposit::getBidderId, deposit.getBidderId());
        }
        if (deposit.getPayStatus() != null && !deposit.getPayStatus().isEmpty()) {
            wrapper.eq(AuctionDeposit::getPayStatus, deposit.getPayStatus());
        }
        if (deposit.getRefundStatus() != null && !deposit.getRefundStatus().isEmpty()) {
            wrapper.eq(AuctionDeposit::getRefundStatus, deposit.getRefundStatus());
        }
        wrapper.orderByDesc(AuctionDeposit::getCreateTime);

        IPage<AuctionDeposit> result = auctionDepositMapper.selectPage(pageParam, wrapper);
        return PageResult.of(result.getTotal(), result.getPages(), result.getCurrent(), result.getSize(), result.getRecords());
    }

    @Override
    public AuctionDeposit getDepositById(Long id) {
        return auctionDepositMapper.selectById(id);
    }

    @Override
    public AuctionDeposit getDepositByNo(String depositNo) {
        return auctionDepositMapper.selectByDepositNo(depositNo);
    }

    @Override
    public List<AuctionDeposit> getMyDepositList(Long bidderId) {
        return auctionDepositMapper.selectByBidderId(bidderId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AuctionDeposit payDeposit(Long itemId, Long bidderId, String payMethod, String payOrderNo) {
        AuctionItem item = auctionItemMapper.selectById(itemId);
        if (item == null) {
            throw new BusinessException("标的不存在");
        }

        if (!"PENDING".equals(item.getItemStatus()) && !"ONGOING".equals(item.getItemStatus())) {
            throw new BusinessException("只有待开始或进行中的标的才能缴纳保证金");
        }

        LambdaQueryWrapper<AuctionDeposit> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AuctionDeposit::getItemId, itemId);
        wrapper.eq(AuctionDeposit::getBidderId, bidderId);
        wrapper.eq(AuctionDeposit::getPayStatus, "paid");
        AuctionDeposit existingDeposit = auctionDepositMapper.selectOne(wrapper);
        if (existingDeposit != null) {
            throw new BusinessException("您已缴纳过该标的的保证金，请勿重复缴纳");
        }

        AuctionDeposit deposit = new AuctionDeposit();
        deposit.setDepositNo(generateDepositNo());
        deposit.setItemId(itemId);
        deposit.setBidderId(bidderId);
        deposit.setDepositAmount(item.getDepositAmount());
        deposit.setPayStatus("paid");
        deposit.setPayTime(LocalDateTime.now());
        deposit.setPayMethod(payMethod);
        deposit.setPayOrderNo(payOrderNo);
        deposit.setBidStatus("bidding");
        deposit.setRefundStatus("norefund");
        deposit.setDeductStatus("nodeduct");
        deposit.setDeductAmount(BigDecimal.ZERO);
        deposit.setRefundableAmount(item.getDepositAmount());
        deposit.setBankAccountEditable(1);
        deposit.setCreateTime(LocalDateTime.now());
        deposit.setUpdateTime(LocalDateTime.now());
        auctionDepositMapper.insert(deposit);

        fundFlowService.createDepositPayFlow(deposit.getId(), item.getDepositAmount(), payMethod, payOrderNo, bidderId);

        auditLogService.logAudit("DEPOSIT", deposit.getId(), deposit.getDepositNo(),
                "PAY", "缴纳保证金", "UNPAID", "PAID", "标的：" + item.getItemName() + "，金额：" + item.getDepositAmount());

        return deposit;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateBankAccount(Long depositId, Long userId, String bankAccount, String bankName, String bankBranch) {
        AuctionDeposit deposit = auctionDepositMapper.selectById(depositId);
        if (deposit == null) {
            throw new BusinessException("保证金记录不存在");
        }

        if (deposit.getBankAccountEditable() == null || deposit.getBankAccountEditable() == 0) {
            throw new BusinessException("退款完成后不可修改收款账号");
        }

        if ("refunded".equals(deposit.getRefundStatus())) {
            throw new BusinessException("退款已完成，不可修改收款账号");
        }

        String beforeBankAccount = deposit.getBankAccount();

        deposit.setBankAccount(bankAccount);
        deposit.setBankName(bankName);
        deposit.setBankBranch(bankBranch);
        deposit.setUpdateTime(LocalDateTime.now());
        auctionDepositMapper.updateById(deposit);

        auditLogService.logAudit("DEPOSIT", depositId, deposit.getDepositNo(),
                "UPDATE_BANK_ACCOUNT", "更新收款账号", beforeBankAccount, bankAccount,
                "开户银行：" + bankName + "，支行：" + bankBranch);
    }

    @Override
    public BigDecimal getRefundableAmount(Long depositId) {
        AuctionDeposit deposit = auctionDepositMapper.selectById(depositId);
        if (deposit == null) {
            throw new BusinessException("保证金记录不存在");
        }

        BigDecimal deductAmount = deposit.getDeductAmount() != null ? deposit.getDeductAmount() : BigDecimal.ZERO;
        return deposit.getDepositAmount().subtract(deductAmount);
    }

    private String generateDepositNo() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "BZJ" + dateStr;

        LambdaQueryWrapper<AuctionDeposit> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(AuctionDeposit::getDepositNo, prefix);
        wrapper.orderByDesc(AuctionDeposit::getDepositNo);
        wrapper.last("LIMIT 1");
        AuctionDeposit lastDeposit = auctionDepositMapper.selectOne(wrapper);

        int sequence = 1;
        if (lastDeposit != null && lastDeposit.getDepositNo() != null) {
            String lastNo = lastDeposit.getDepositNo();
            String seqStr = lastNo.substring(prefix.length());
            try {
                sequence = Integer.parseInt(seqStr) + 1;
            } catch (NumberFormatException e) {
                sequence = new Random().nextInt(900) + 100;
            }
        }

        if (sequence > 999) {
            sequence = new Random().nextInt(900) + 100;
        }

        return prefix + String.format("%03d", sequence);
    }
}
