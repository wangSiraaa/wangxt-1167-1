package com.auction.deposit.service.impl;

import com.auction.deposit.common.BusinessException;
import com.auction.deposit.common.CurrentUser;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.entity.AuctionBid;
import com.auction.deposit.entity.AuctionDeposit;
import com.auction.deposit.entity.AuctionItem;
import com.auction.deposit.mapper.AuctionBidMapper;
import com.auction.deposit.mapper.AuctionDepositMapper;
import com.auction.deposit.mapper.AuctionItemMapper;
import com.auction.deposit.service.AuctionItemService;
import com.auction.deposit.service.AuditLogService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuctionItemServiceImpl implements AuctionItemService {

    @Autowired
    private AuctionItemMapper auctionItemMapper;

    @Autowired
    private AuctionBidMapper auctionBidMapper;

    @Autowired
    private AuctionDepositMapper auctionDepositMapper;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    public PageResult<AuctionItem> getItemList(PageResult<AuctionItem> page, AuctionItem item) {
        IPage<AuctionItem> pageParam = new Page<>(page.getCurrent(), page.getSize());
        LambdaQueryWrapper<AuctionItem> wrapper = new LambdaQueryWrapper<>();

        if (item.getItemName() != null && !item.getItemName().isEmpty()) {
            wrapper.like(AuctionItem::getItemName, item.getItemName());
        }
        if (item.getItemType() != null && !item.getItemType().isEmpty()) {
            wrapper.eq(AuctionItem::getItemType, item.getItemType());
        }
        if (item.getItemStatus() != null && !item.getItemStatus().isEmpty()) {
            wrapper.eq(AuctionItem::getItemStatus, item.getItemStatus());
        }
        if (item.getDealStatus() != null && !item.getDealStatus().isEmpty()) {
            wrapper.eq(AuctionItem::getDealStatus, item.getDealStatus());
        }
        wrapper.orderByDesc(AuctionItem::getCreateTime);

        IPage<AuctionItem> result = auctionItemMapper.selectPage(pageParam, wrapper);
        return PageResult.of(result.getTotal(), result.getPages(), result.getCurrent(), result.getSize(), result.getRecords());
    }

    @Override
    public AuctionItem getItemById(Long id) {
        return auctionItemMapper.selectById(id);
    }

    @Override
    public void addItem(AuctionItem item) {
        item.setCreateBy(CurrentUser.getUserId());
        item.setCreateTime(LocalDateTime.now());
        item.setUpdateBy(CurrentUser.getUserId());
        item.setUpdateTime(LocalDateTime.now());
        auctionItemMapper.insert(item);

        auditLogService.logAudit("AUCTION_ITEM", item.getId(), item.getItemCode(),
                "ADD", "新增拍卖标的", null, item.getItemStatus(), "新增标的：" + item.getItemName());
    }

    @Override
    public void updateItem(AuctionItem item) {
        AuctionItem oldItem = auctionItemMapper.selectById(item.getId());
        if (oldItem == null) {
            throw new BusinessException("标的不存在");
        }

        String beforeStatus = oldItem.getItemStatus();
        item.setUpdateBy(CurrentUser.getUserId());
        item.setUpdateTime(LocalDateTime.now());
        auctionItemMapper.updateById(item);

        auditLogService.logAudit("AUCTION_ITEM", item.getId(), item.getItemCode(),
                "UPDATE", "修改拍卖标的", beforeStatus, item.getItemStatus(), "修改标的：" + item.getItemName());
    }

    @Override
    public void deleteItem(Long id) {
        AuctionItem item = auctionItemMapper.selectById(id);
        if (item == null) {
            throw new BusinessException("标的不存在");
        }

        auctionItemMapper.deleteById(id);

        auditLogService.logAudit("AUCTION_ITEM", id, item.getItemCode(),
                "DELETE", "删除拍卖标的", item.getItemStatus(), null, "删除标的：" + item.getItemName());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmDeal(Long itemId, Long winnerId, BigDecimal dealPrice) {
        AuctionItem item = auctionItemMapper.selectById(itemId);
        if (item == null) {
            throw new BusinessException("标的不存在");
        }
        if ("DEALED".equals(item.getDealStatus())) {
            throw new BusinessException("标的已成交，请勿重复确认");
        }

        String beforeStatus = item.getDealStatus();

        item.setWinnerId(winnerId);
        item.setDealPrice(dealPrice);
        item.setDealTime(LocalDateTime.now());
        item.setDealStatus("DEALED");
        item.setUpdateBy(CurrentUser.getUserId());
        item.setUpdateTime(LocalDateTime.now());
        auctionItemMapper.updateById(item);

        LambdaQueryWrapper<AuctionBid> bidWrapper = new LambdaQueryWrapper<>();
        bidWrapper.eq(AuctionBid::getItemId, itemId);
        List<AuctionBid> bidList = auctionBidMapper.selectList(bidWrapper);
        for (AuctionBid bid : bidList) {
            if (bid.getBidderId().equals(winnerId)) {
                bid.setIsWinner(1);
            } else {
                bid.setIsWinner(0);
            }
            auctionBidMapper.updateById(bid);
        }

        LambdaQueryWrapper<AuctionDeposit> depositWrapper = new LambdaQueryWrapper<>();
        depositWrapper.eq(AuctionDeposit::getItemId, itemId);
        List<AuctionDeposit> depositList = auctionDepositMapper.selectList(depositWrapper);
        for (AuctionDeposit deposit : depositList) {
            if (deposit.getBidderId().equals(winnerId)) {
                deposit.setBidStatus("WON");
            } else {
                deposit.setBidStatus("LOST");
            }
            deposit.setUpdateTime(LocalDateTime.now());
            auctionDepositMapper.updateById(deposit);
        }

        auditLogService.logAudit("AUCTION_ITEM", itemId, item.getItemCode(),
                "CONFIRM_DEAL", "确认成交", beforeStatus, "DEALED",
                "竞得人ID：" + winnerId + "，成交价：" + dealPrice);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateTailPayment(Long itemId, BigDecimal paidAmount) {
        AuctionItem item = auctionItemMapper.selectById(itemId);
        if (item == null) {
            throw new BusinessException("标的不存在");
        }
        if (!"DEALED".equals(item.getDealStatus())) {
            throw new BusinessException("标的未成交，无法更新尾款支付");
        }

        String beforeStatus = item.getTailPaidStatus();

        item.setTailPaidAmount(paidAmount);
        if (paidAmount.compareTo(BigDecimal.ZERO) > 0) {
            if (paidAmount.compareTo(item.getDealPrice().subtract(item.getDepositAmount())) >= 0) {
                item.setTailPaidStatus("PAID");
            } else {
                item.setTailPaidStatus("PARTIAL");
            }
        } else {
            item.setTailPaidStatus("UNPAID");
        }
        item.setUpdateBy(CurrentUser.getUserId());
        item.setUpdateTime(LocalDateTime.now());
        auctionItemMapper.updateById(item);

        auditLogService.logAudit("AUCTION_ITEM", itemId, item.getItemCode(),
                "TAIL_PAYMENT", "更新尾款支付", beforeStatus, item.getTailPaidStatus(),
                "尾款支付金额：" + paidAmount);
    }
}
