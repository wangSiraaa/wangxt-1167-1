package com.auction.deposit.controller;

import com.auction.deposit.common.Constants;
import com.auction.deposit.common.CurrentUser;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.common.Result;
import com.auction.deposit.dto.DeductDTO;
import com.auction.deposit.entity.DeductRecord;
import com.auction.deposit.service.DeductService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Api(tags = "抵扣管理")
@RestController
@RequestMapping("/deduct")
public class DeductController {

    @Autowired
    private DeductService deductService;

    @ApiOperation("抵扣记录列表")
    @GetMapping("/list")
    public Result<PageResult<DeductRecord>> list(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_NUM) Long current,
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_SIZE) Long size,
            DeductRecord record) {
        PageResult<DeductRecord> page = new PageResult<>();
        page.setCurrent(current);
        page.setSize(size);
        PageResult<DeductRecord> result = deductService.getDeductList(page, record);
        return Result.success(result);
    }

    @ApiOperation("抵扣详情")
    @GetMapping("/{id}")
    public Result<DeductRecord> getById(@PathVariable Long id) {
        DeductRecord record = deductService.getDeductById(id);
        return Result.success(record);
    }

    @ApiOperation("执行抵扣（财务）")
    @PostMapping("/execute")
    public Result<Void> execute(@RequestBody DeductDTO dto) {
        DeductRecord record = new DeductRecord();
        BeanUtils.copyProperties(dto, record);
        deductService.deductDeposit(dto.getDepositId(), CurrentUser.getUserId(), record);
        return Result.success();
    }
}
