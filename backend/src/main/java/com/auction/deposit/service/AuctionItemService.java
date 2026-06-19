package com.auction.deposit.service;

import com.auction.deposit.common.PageResult;
import com.auction.deposit.entity.AuctionItem;

import java.math.BigDecimal;

public interface AuctionItemService {

    PageResult<AuctionItem> getItemList(PageResult<AuctionItem> page, AuctionItem item);

    AuctionItem getItemById(Long id);

    void addItem(AuctionItem item);

    void updateItem(AuctionItem item);

    void deleteItem(Long id);

    void confirmDeal(Long itemId, Long winnerId, BigDecimal dealPrice);

    void updateTailPayment(Long itemId, BigDecimal paidAmount);
}
