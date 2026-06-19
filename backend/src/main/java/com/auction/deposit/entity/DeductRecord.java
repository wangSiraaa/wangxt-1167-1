package com.auction.deposit.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("deduct_record")
public class DeductRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String deductNo;

    private Long depositId;

    private Long itemId;

    private Long bidderId;

    private BigDecimal deductAmount;

    private String deductType;

    private String deductReason;

    private Long operatorId;

    private LocalDateTime operateTime;

    private String remark;

    private LocalDateTime createTime;
}
