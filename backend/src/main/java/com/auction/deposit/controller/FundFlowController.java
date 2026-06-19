package com.auction.deposit.controller;

import com.auction.deposit.common.Constants;
import com.auction.deposit.common.CurrentUser;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.common.Result;
import com.auction.deposit.entity.FundFlow;
import com.auction.deposit.service.FundFlowService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Api(tags = "资金流水")
@RestController
@RequestMapping("/fund/flow")
public class FundFlowController {

    @Autowired
    private FundFlowService fundFlowService;

    @ApiOperation("流水列表")
    @GetMapping("/list")
    public Result<PageResult<FundFlow>> list(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_NUM) Long current,
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_SIZE) Long size,
            FundFlow flow) {
        PageResult<FundFlow> page = new PageResult<>();
        page.setCurrent(current);
        page.setSize(size);
        PageResult<FundFlow> result = fundFlowService.getFlowList(page, flow);
        return Result.success(result);
    }

    @ApiOperation("流水详情")
    @GetMapping("/{id}")
    public Result<FundFlow> getById(@PathVariable Long id) {
        FundFlow flow = fundFlowService.getFlowById(id);
        return Result.success(flow);
    }

    @ApiOperation("我的流水")
    @GetMapping("/myFlow")
    public Result<PageResult<FundFlow>> myFlow(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_NUM) Long current,
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_SIZE) Long size,
            FundFlow flow) {
        PageResult<FundFlow> page = new PageResult<>();
        page.setCurrent(current);
        page.setSize(size);
        flow.setUserId(CurrentUser.getUserId());
        PageResult<FundFlow> result = fundFlowService.getFlowList(page, flow);
        return Result.success(result);
    }
}
