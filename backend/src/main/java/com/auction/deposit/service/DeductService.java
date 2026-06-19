package com.auction.deposit.service;

import com.auction.deposit.common.PageResult;
import com.auction.deposit.entity.DeductRecord;

import java.math.BigDecimal;

public interface DeductService {

    PageResult<DeductRecord> getDeductList(PageResult<DeductRecord> page, DeductRecord record);

    DeductRecord getDeductById(Long id);

    void deductDeposit(Long depositId, Long operatorId, DeductRecord record);
}
