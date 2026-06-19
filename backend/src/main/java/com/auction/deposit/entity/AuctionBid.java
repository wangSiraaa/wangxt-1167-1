package com.auction.deposit.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("auction_bid")
public class AuctionBid {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long itemId;

    private Long bidderId;

    private BigDecimal bidPrice;

    private LocalDateTime bidTime;

    private Integer isWinner;

    private LocalDateTime createTime;
}
