package com.auction.deposit.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class FundChainDTO {

    private Long depositId;

    private String depositNo;

    private Long itemId;

    private String itemName;

    private Long bidderId;

    private String bidderName;

    private BigDecimal depositAmount;

    private String bidStatus;

    private String payStatus;

    private String refundStatus;

    private String deductStatus;

    private List<ChainNode> chainNodes;

    @Data
    public static class ChainNode {

        private String nodeType;

        private String nodeName;

        private String nodeStatus;

        private BigDecimal amount;

        private LocalDateTime operateTime;

        private String operator;

        private String orderNo;

        private String remark;
    }
}
