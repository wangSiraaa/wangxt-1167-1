package com.auction.deposit.mapper;

import com.auction.deposit.entity.RefundApply;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface RefundApplyMapper extends BaseMapper<RefundApply> {

    RefundApply selectByRefundNo(@Param("refundNo") String refundNo);

    List<RefundApply> selectByDepositId(@Param("depositId") Long depositId);
}
