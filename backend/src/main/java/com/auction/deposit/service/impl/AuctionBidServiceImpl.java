package com.auction.deposit.service.impl;

import com.auction.deposit.common.PageResult;
import com.auction.deposit.entity.AuctionBid;
import com.auction.deposit.mapper.AuctionBidMapper;
import com.auction.deposit.service.AuctionBidService;
import com.auction.deposit.service.AuditLogService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuctionBidServiceImpl implements AuctionBidService {

    @Autowired
    private AuctionBidMapper auctionBidMapper;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    public PageResult<AuctionBid> getBidList(PageResult<AuctionBid> page, Long itemId) {
        IPage<AuctionBid> pageParam = new Page<>(page.getCurrent(), page.getSize());
        LambdaQueryWrapper<AuctionBid> wrapper = new LambdaQueryWrapper<>();

        if (itemId != null) {
            wrapper.eq(AuctionBid::getItemId, itemId);
        }
        wrapper.orderByDesc(AuctionBid::getBidTime);

        IPage<AuctionBid> result = auctionBidMapper.selectPage(pageParam, wrapper);
        return PageResult.of(result.getTotal(), result.getPages(), result.getCurrent(), result.getSize(), result.getRecords());
    }

    @Override
    public List<AuctionBid> getBidListByBidder(Long bidderId) {
        LambdaQueryWrapper<AuctionBid> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AuctionBid::getBidderId, bidderId);
        wrapper.orderByDesc(AuctionBid::getBidTime);
        return auctionBidMapper.selectList(wrapper);
    }

    @Override
    public void placeBid(Long itemId, Long bidderId, BigDecimal price) {
        AuctionBid bid = new AuctionBid();
        bid.setItemId(itemId);
        bid.setBidderId(bidderId);
        bid.setBidPrice(price);
        bid.setBidTime(LocalDateTime.now());
        bid.setIsWinner(0);
        bid.setCreateTime(LocalDateTime.now());
        auctionBidMapper.insert(bid);

        auditLogService.logAudit("AUCTION_BID", bid.getId(), String.valueOf(bid.getId()),
                "PLACE_BID", "出价竞买", null, null,
                "标的ID：" + itemId + "，出价：" + price);
    }
}
