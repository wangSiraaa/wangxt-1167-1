package com.auction.deposit.controller;

import com.auction.deposit.common.Constants;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.common.Result;
import com.auction.deposit.dto.DepositBankAccountDTO;
import com.auction.deposit.dto.DepositPayDTO;
import com.auction.deposit.entity.AuctionDeposit;
import com.auction.deposit.service.DepositService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@Api(tags = "保证金管理")
@RestController
@RequestMapping("/deposit")
public class DepositController {

    @Autowired
    private DepositService depositService;

    @ApiOperation("分页查询保证金列表（管理员/财务）")
    @GetMapping("/list")
    public Result<PageResult<AuctionDeposit>> list(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_NUM) Long current,
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_SIZE) Long size,
            AuctionDeposit deposit) {
        PageResult<AuctionDeposit> page = new PageResult<>();
        page.setCurrent(current);
        page.setSize(size);
        PageResult<AuctionDeposit> result = depositService.getDepositList(page, deposit);
        return Result.success(result);
    }

    @ApiOperation("查询保证金详情")
    @GetMapping("/{id}")
    public Result<AuctionDeposit> getById(@PathVariable Long id) {
        AuctionDeposit deposit = depositService.getDepositById(id);
        return Result.success(deposit);
    }

    @ApiOperation("我的保证金列表（竞买人）")
    @GetMapping("/myList")
    public Result<List<AuctionDeposit>> myList(@RequestParam Long bidderId) {
        List<AuctionDeposit> list = depositService.getMyDepositList(bidderId);
        return Result.success(list);
    }

    @ApiOperation("缴纳保证金")
    @PostMapping("/pay")
    public Result<AuctionDeposit> pay(@Valid @RequestBody DepositPayDTO dto) {
        AuctionDeposit deposit = depositService.payDeposit(
                dto.getItemId(),
                dto.getBidderId(),
                dto.getPayMethod(),
                dto.getPayOrderNo()
        );
        return Result.success(deposit);
    }

    @ApiOperation("更新收款账号")
    @PutMapping("/bankAccount")
    public Result<Void> updateBankAccount(@Valid @RequestBody DepositBankAccountDTO dto) {
        depositService.updateBankAccount(
                dto.getDepositId(),
                dto.getUserId(),
                dto.getBankAccount(),
                dto.getBankName(),
                dto.getBankBranch()
        );
        return Result.success();
    }
}
