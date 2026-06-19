package com.auction.deposit.service;

import com.auction.deposit.common.PageResult;
import com.auction.deposit.entity.AuctionBid;

import java.math.BigDecimal;
import java.util.List;

public interface AuctionBidService {

    PageResult<AuctionBid> getBidList(PageResult<AuctionBid> page, Long itemId);

    List<AuctionBid> getBidListByBidder(Long bidderId);

    void placeBid(Long itemId, Long bidderId, BigDecimal price);
}
