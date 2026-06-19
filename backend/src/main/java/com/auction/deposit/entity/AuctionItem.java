package com.auction.deposit.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("auction_item")
public class AuctionItem {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String itemCode;

    private String itemName;

    private String itemType;

    private String itemDesc;

    private String courtName;

    private BigDecimal startingPrice;

    private BigDecimal depositAmount;

    private LocalDateTime auctionStartTime;

    private LocalDateTime auctionEndTime;

    private String itemStatus;

    private String dealStatus;

    private Long winnerId;

    private BigDecimal dealPrice;

    private LocalDateTime dealTime;

    private String tailPaidStatus;

    private BigDecimal tailPaidAmount;

    private Long createBy;

    private LocalDateTime createTime;

    private Long updateBy;

    private LocalDateTime updateTime;
}
