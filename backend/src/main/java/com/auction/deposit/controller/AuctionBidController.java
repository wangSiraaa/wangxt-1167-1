package com.auction.deposit.controller;

import com.auction.deposit.common.Constants;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.common.Result;
import com.auction.deposit.entity.AuctionBid;
import com.auction.deposit.service.AuctionBidService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Api(tags = "竞买记录管理")
@RestController
@RequestMapping("/auction/bid")
public class AuctionBidController {

    @Autowired
    private AuctionBidService auctionBidService;

    @ApiOperation("竞买记录列表")
    @GetMapping("/list")
    public Result<PageResult<AuctionBid>> list(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_NUM) Long current,
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_SIZE) Long size,
            @RequestParam(required = false) Long itemId) {
        PageResult<AuctionBid> page = new PageResult<>();
        page.setCurrent(current);
        page.setSize(size);
        PageResult<AuctionBid> result = auctionBidService.getBidList(page, itemId);
        return Result.success(result);
    }
}
