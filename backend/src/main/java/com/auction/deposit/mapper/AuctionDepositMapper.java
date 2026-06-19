package com.auction.deposit.mapper;

import com.auction.deposit.entity.AuctionDeposit;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface AuctionDepositMapper extends BaseMapper<AuctionDeposit> {

    AuctionDeposit selectByDepositNo(@Param("depositNo") String depositNo);

    List<AuctionDeposit> selectByBidderId(@Param("bidderId") Long bidderId);
}
