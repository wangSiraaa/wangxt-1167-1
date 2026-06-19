package com.auction.deposit.service.impl;

import com.auction.deposit.common.BusinessException;
import com.auction.deposit.common.CurrentUser;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.entity.FundFlow;
import com.auction.deposit.mapper.FundFlowMapper;
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
public class FundFlowServiceImpl implements FundFlowService {

    @Autowired
    private FundFlowMapper fundFlowMapper;

    @Override
    public PageResult<FundFlow> getFlowList(PageResult<FundFlow> page, FundFlow flow) {
        IPage<FundFlow> pageParam = new Page<>(page.getCurrent(), page.getSize());
        LambdaQueryWrapper<FundFlow> wrapper = new LambdaQueryWrapper<>();

        if (flow.getFlowNo() != null && !flow.getFlowNo().isEmpty()) {
            wrapper.like(FundFlow::getFlowNo, flow.getFlowNo());
        }
        if (flow.getFlowType() != null && !flow.getFlowType().isEmpty()) {
            wrapper.eq(FundFlow::getFlowType, flow.getFlowType());
        }
        if (flow.getDirection() != null && !flow.getDirection().isEmpty()) {
            wrapper.eq(FundFlow::getDirection, flow.getDirection());
        }
        if (flow.getRelateType() != null && !flow.getRelateType().isEmpty()) {
            wrapper.eq(FundFlow::getRelateType, flow.getRelateType());
        }
        if (flow.getRelateId() != null) {
            wrapper.eq(FundFlow::getRelateId, flow.getRelateId());
        }
        if (flow.getUserId() != null) {
            wrapper.eq(FundFlow::getUserId, flow.getUserId());
        }
        if (flow.getFlowStatus() != null && !flow.getFlowStatus().isEmpty()) {
            wrapper.eq(FundFlow::getFlowStatus, flow.getFlowStatus());
        }
        wrapper.orderByDesc(FundFlow::getCreateTime);

        IPage<FundFlow> result = fundFlowMapper.selectPage(pageParam, wrapper);
        return PageResult.of(result.getTotal(), result.getPages(), result.getCurrent(), result.getSize(), result.getRecords());
    }

    @Override
    public FundFlow getFlowById(Long id) {
        return fundFlowMapper.selectById(id);
    }

    @Override
    public FundFlow getFlowByNo(String flowNo) {
        LambdaQueryWrapper<FundFlow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FundFlow::getFlowNo, flowNo);
        return fundFlowMapper.selectOne(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public FundFlow createFlow(FundFlow flow) {
        flow.setFlowNo(generateFlowNo());
        flow.setCreateTime(LocalDateTime.now());
        if (flow.getOperatorId() == null) {
            flow.setOperatorId(CurrentUser.getUserId());
        }
        fundFlowMapper.insert(flow);
        return flow;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createDepositPayFlow(Long depositId, BigDecimal amount, String payMethod, String payOrderNo, Long userId) {
        FundFlow flow = new FundFlow();
        flow.setFlowType("DEPOSIT_PAY");
        flow.setAmount(amount);
        flow.setDirection("IN");
        flow.setRelateType("DEPOSIT");
        flow.setRelateId(depositId);
        flow.setUserId(userId);
        flow.setPayMethod(payMethod);
        flow.setPayOrderNo(payOrderNo);
        flow.setFlowStatus("SUCCESS");
        flow.setRemark("保证金缴纳");
        createFlow(flow);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createDepositRefundFlow(Long refundId, BigDecimal amount, String payOrderNo, Long userId) {
        FundFlow flow = new FundFlow();
        flow.setFlowType("DEPOSIT_REFUND");
        flow.setAmount(amount);
        flow.setDirection("OUT");
        flow.setRelateType("REFUND");
        flow.setRelateId(refundId);
        flow.setUserId(userId);
        flow.setPayOrderNo(payOrderNo);
        flow.setFlowStatus("SUCCESS");
        flow.setRemark("保证金退款");
        createFlow(flow);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createDepositDeductFlow(Long deductId, BigDecimal amount, Long userId) {
        FundFlow flow = new FundFlow();
        flow.setFlowType("DEPOSIT_DEDUCT");
        flow.setAmount(amount);
        flow.setDirection("OUT");
        flow.setRelateType("DEDUCT");
        flow.setRelateId(deductId);
        flow.setUserId(userId);
        flow.setFlowStatus("SUCCESS");
        flow.setRemark("保证金抵扣");
        createFlow(flow);
    }

    private String generateFlowNo() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "LS" + dateStr;

        LambdaQueryWrapper<FundFlow> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(FundFlow::getFlowNo, prefix);
        wrapper.orderByDesc(FundFlow::getFlowNo);
        wrapper.last("LIMIT 1");
        FundFlow lastFlow = fundFlowMapper.selectOne(wrapper);

        int sequence = 1;
        if (lastFlow != null && lastFlow.getFlowNo() != null) {
            String lastNo = lastFlow.getFlowNo();
            String seqStr = lastNo.substring(prefix.length());
            try {
                sequence = Integer.parseInt(seqStr) + 1;
            } catch (NumberFormatException e) {
                sequence = 1;
            }
        }

        return prefix + String.format("%05d", sequence);
    }
}
