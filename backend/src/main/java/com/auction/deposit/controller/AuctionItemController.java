package com.auction.deposit.controller;

import com.auction.deposit.common.Constants;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.common.Result;
import com.auction.deposit.entity.AuctionItem;
import com.auction.deposit.service.AuctionItemService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Api(tags = "拍卖标的管理")
@RestController
@RequestMapping("/auction/item")
public class AuctionItemController {

    @Autowired
    private AuctionItemService auctionItemService;

    @ApiOperation("分页查询标的列表")
    @GetMapping("/list")
    public Result<PageResult<AuctionItem>> list(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_NUM) Long current,
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_SIZE) Long size,
            AuctionItem item) {
        PageResult<AuctionItem> page = new PageResult<>();
        page.setCurrent(current);
        page.setSize(size);
        PageResult<AuctionItem> result = auctionItemService.getItemList(page, item);
        return Result.success(result);
    }

    @ApiOperation("查询标的详情")
    @GetMapping("/{id}")
    public Result<AuctionItem> getById(@PathVariable Long id) {
        AuctionItem item = auctionItemService.getItemById(id);
        return Result.success(item);
    }

    @ApiOperation("新增标的")
    @PostMapping
    public Result<Void> add(@RequestBody AuctionItem item) {
        auctionItemService.addItem(item);
        return Result.success();
    }

    @ApiOperation("修改标的")
    @PutMapping
    public Result<Void> update(@RequestBody AuctionItem item) {
        auctionItemService.updateItem(item);
        return Result.success();
    }

    @ApiOperation("删除标的")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        auctionItemService.deleteItem(id);
        return Result.success();
    }

    @ApiOperation("确认成交（管理员）")
    @PutMapping("/confirmDeal")
    public Result<Void> confirmDeal(
            @RequestParam Long itemId,
            @RequestParam Long winnerId,
            @RequestParam BigDecimal dealPrice) {
        auctionItemService.confirmDeal(itemId, winnerId, dealPrice);
        return Result.success();
    }

    @ApiOperation("更新尾款支付（财务）")
    @PutMapping("/tailPayment")
    public Result<Void> tailPayment(
            @RequestParam Long itemId,
            @RequestParam BigDecimal paidAmount) {
        auctionItemService.updateTailPayment(itemId, paidAmount);
        return Result.success();
    }
}
