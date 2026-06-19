package com.auction.deposit.service.impl;

import com.auction.deposit.common.BusinessException;
import com.auction.deposit.common.CurrentUser;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.dto.FundChainDTO;
import com.auction.deposit.entity.*;
import com.auction.deposit.mapper.*;
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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FundFlowServiceImpl implements FundFlowService {

    @Autowired
    private FundFlowMapper fundFlowMapper;

    @Autowired
    private AuctionDepositMapper auctionDepositMapper;

    @Autowired
    private AuctionItemMapper auctionItemMapper;

    @Autowired
    private AuctionBidMapper auctionBidMapper;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private RefundApplyMapper refundApplyMapper;

    @Autowired
    private DeductRecordMapper deductRecordMapper;

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
        flow.setFlowType("deposit_pay");
        flow.setAmount(amount);
        flow.setDirection("in");
        flow.setRelateType("deposit");
        flow.setRelateId(depositId);
        flow.setUserId(userId);
        flow.setPayMethod(payMethod);
        flow.setPayOrderNo(payOrderNo);
        flow.setFlowStatus("success");
        flow.setRemark("保证金缴纳");
        createFlow(flow);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createDepositRefundFlow(Long refundId, BigDecimal amount, String payOrderNo, Long userId) {
        FundFlow flow = new FundFlow();
        flow.setFlowType("deposit_refund");
        flow.setAmount(amount);
        flow.setDirection("out");
        flow.setRelateType("refund");
        flow.setRelateId(refundId);
        flow.setUserId(userId);
        flow.setPayOrderNo(payOrderNo);
        flow.setFlowStatus("success");
        flow.setRemark("保证金退款");
        createFlow(flow);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createDepositDeductFlow(Long deductId, BigDecimal amount, Long userId) {
        FundFlow flow = new FundFlow();
        flow.setFlowType("deposit_deduct");
        flow.setAmount(amount);
        flow.setDirection("out");
        flow.setRelateType("deduct");
        flow.setRelateId(deductId);
        flow.setUserId(userId);
        flow.setFlowStatus("success");
        flow.setRemark("保证金抵扣");
        createFlow(flow);
    }

    @Override
    public FundChainDTO getFundChain(Long depositId) {
        AuctionDeposit deposit = auctionDepositMapper.selectById(depositId);
        if (deposit == null) {
            throw new BusinessException("保证金记录不存在");
        }
        return buildFundChain(deposit);
    }

    @Override
    public List<FundChainDTO> getFundChainByItemId(Long itemId) {
        LambdaQueryWrapper<AuctionDeposit> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AuctionDeposit::getItemId, itemId);
        List<AuctionDeposit> depositList = auctionDepositMapper.selectList(wrapper);
        List<FundChainDTO> result = new ArrayList<>();
        for (AuctionDeposit deposit : depositList) {
            result.add(buildFundChain(deposit));
        }
        return result;
    }

    private FundChainDTO buildFundChain(AuctionDeposit deposit) {
        FundChainDTO dto = new FundChainDTO();
        dto.setDepositId(deposit.getId());
        dto.setDepositNo(deposit.getDepositNo());
        dto.setItemId(deposit.getItemId());
        dto.setBidderId(deposit.getBidderId());
        dto.setDepositAmount(deposit.getDepositAmount());
        dto.setBidStatus(deposit.getBidStatus());
        dto.setPayStatus(deposit.getPayStatus());
        dto.setRefundStatus(deposit.getRefundStatus());
        dto.setDeductStatus(deposit.getDeductStatus());

        AuctionItem item = auctionItemMapper.selectById(deposit.getItemId());
        if (item != null) {
            dto.setItemName(item.getItemName());
        }

        SysUser bidder = sysUserMapper.selectById(deposit.getBidderId());
        if (bidder != null) {
            dto.setBidderName(bidder.getRealName());
        }

        List<FundChainDTO.ChainNode> nodes = new ArrayList<>();

        FundChainDTO.ChainNode payNode = new FundChainDTO.ChainNode();
        payNode.setNodeType("deposit_pay");
        payNode.setNodeName("保证金缴纳");
        payNode.setNodeStatus(deposit.getPayStatus());
        payNode.setAmount(deposit.getDepositAmount());
        payNode.setOperateTime(deposit.getPayTime());
        payNode.setOrderNo(deposit.getPayOrderNo());
        payNode.setRemark("保证金缴纳");
        nodes.add(payNode);

        LambdaQueryWrapper<AuctionBid> bidWrapper = new LambdaQueryWrapper<>();
        bidWrapper.eq(AuctionBid::getItemId, deposit.getItemId());
        bidWrapper.eq(AuctionBid::getBidderId, deposit.getBidderId());
        bidWrapper.orderByDesc(AuctionBid::getBidTime);
        List<AuctionBid> bidList = auctionBidMapper.selectList(bidWrapper);
        Map<LocalDateTime, List<AuctionBid>> bidMap = bidList.stream()
                .collect(Collectors.groupingBy(AuctionBid::getBidTime));
        for (Map.Entry<LocalDateTime, List<AuctionBid>> entry : bidMap.entrySet()) {
            AuctionBid latestBid = entry.getValue().get(0);
            FundChainDTO.ChainNode bidNode = new FundChainDTO.ChainNode();
            bidNode.setNodeType("auction_bid");
            bidNode.setNodeName("竞买出价");
            bidNode.setNodeStatus("success");
            bidNode.setAmount(latestBid.getBidPrice());
            bidNode.setOperateTime(entry.getKey());
            bidNode.setRemark("竞买出价次数：" + entry.getValue().size() + "，最高出价：" + latestBid.getBidPrice());
            nodes.add(bidNode);
        }

        if ("won".equals(deposit.getBidStatus()) && item != null) {
            FundChainDTO.ChainNode dealNode = new FundChainDTO.ChainNode();
            dealNode.setNodeType("auction_deal");
            dealNode.setNodeName("拍卖成交");
            dealNode.setNodeStatus("success");
            dealNode.setAmount(item.getDealPrice());
            dealNode.setOperateTime(item.getDealTime());
            dealNode.setRemark("竞得成交价：" + item.getDealPrice());
            nodes.add(dealNode);

            if ("paid".equals(item.getTailPaidStatus())) {
                FundChainDTO.ChainNode tailNode = new FundChainDTO.ChainNode();
                tailNode.setNodeType("tail_payment");
                tailNode.setNodeName("尾款支付");
                tailNode.setNodeStatus("paid");
                tailNode.setAmount(item.getTailAmount());
                tailNode.setOperateTime(item.getTailPaidTime());
                tailNode.setRemark("尾款支付，成交人保证金可申请退款或抵扣");
                nodes.add(tailNode);
            } else if ("pending_deduct".equals(deposit.getDeductStatus())) {
                FundChainDTO.ChainNode pendingDeductNode = new FundChainDTO.ChainNode();
                pendingDeductNode.setNodeType("pending_deduct");
                pendingDeductNode.setNodeName("待抵扣尾款");
                pendingDeductNode.setNodeStatus("pending_deduct");
                pendingDeductNode.setAmount(deposit.getDepositAmount());
                pendingDeductNode.setOperateTime(deposit.getUpdateTime());
                pendingDeductNode.setRemark("成交确认，保证金转入待抵扣尾款状态，暂不可退款");
                nodes.add(pendingDeductNode);
            }
        } else if ("lost".equals(deposit.getBidStatus())) {
            FundChainDTO.ChainNode lostNode = new FundChainDTO.ChainNode();
            lostNode.setNodeType("auction_lost");
            lostNode.setNodeName("竞买未成交");
            lostNode.setNodeStatus("lost");
            lostNode.setOperateTime(deposit.getUpdateTime());
            lostNode.setRemark("未竞得，保证金可申请退款");
            nodes.add(lostNode);
        }

        LambdaQueryWrapper<DeductRecord> deductWrapper = new LambdaQueryWrapper<>();
        deductWrapper.eq(DeductRecord::getDepositId, deposit.getId());
        deductWrapper.orderByAsc(DeductRecord::getCreateTime);
        List<DeductRecord> deductList = deductRecordMapper.selectList(deductWrapper);
        for (DeductRecord dr : deductList) {
            FundChainDTO.ChainNode deductNode = new FundChainDTO.ChainNode();
            deductNode.setNodeType("deposit_deduct");
            deductNode.setNodeName("保证金抵扣");
            deductNode.setNodeStatus(dr.getDeductStatus());
            deductNode.setAmount(dr.getDeductAmount());
            deductNode.setOperateTime(dr.getCreateTime());
            deductNode.setOrderNo(dr.getDeductNo());
            deductNode.setRemark(dr.getDeductReason());
            nodes.add(deductNode);
        }

        LambdaQueryWrapper<RefundApply> refundWrapper = new LambdaQueryWrapper<>();
        refundWrapper.eq(RefundApply::getDepositId, deposit.getId());
        refundWrapper.orderByAsc(RefundApply::getApplyTime);
        List<RefundApply> refundList = refundApplyMapper.selectList(refundWrapper);
        for (RefundApply ra : refundList) {
            FundChainDTO.ChainNode refundNode = new FundChainDTO.ChainNode();
            refundNode.setNodeType("deposit_refund");
            refundNode.setNodeName(ra.getParentId() != null ? "重提退款申请" : "退款申请");
            refundNode.setNodeStatus(ra.getApplyStatus());
            refundNode.setAmount(ra.getRefundAmount());
            refundNode.setOperateTime(ra.getApplyTime());
            refundNode.setOrderNo(ra.getRefundNo());
            SysUser applyUser = sysUserMapper.selectById(ra.getApplyBy());
            refundNode.setOperator(applyUser != null ? applyUser.getRealName() : null);
            StringBuilder refundRemark = new StringBuilder();
            refundRemark.append(ra.getRefundReason() != null ? ra.getRefundReason() : "");
            if ("failed".equals(ra.getApplyStatus()) && ra.getFailReason() != null) {
                refundRemark.append("；失败原因：").append(ra.getFailReason());
            }
            if ("rejected".equals(ra.getApplyStatus()) && ra.getAuditRemark() != null) {
                refundRemark.append("；审核驳回：").append(ra.getAuditRemark());
            }
            if ("completed".equals(ra.getApplyStatus())) {
                refundRemark.append("；退款完成");
                refundNode.setOperateTime(ra.getCompleteTime() != null ? ra.getCompleteTime() : ra.getApplyTime());
            }
            if (ra.getParentId() != null) {
                RefundApply parent = refundApplyMapper.selectById(ra.getParentId());
                if (parent != null) {
                    refundRemark.insert(0, "关联原申请：" + parent.getRefundNo() + "；");
                }
            }
            refundNode.setRemark(refundRemark.toString());
            nodes.add(refundNode);
        }

        nodes.sort(Comparator.comparing(n -> n.getOperateTime() != null ? n.getOperateTime() : LocalDateTime.MIN));

        dto.setChainNodes(nodes);
        return dto;
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
