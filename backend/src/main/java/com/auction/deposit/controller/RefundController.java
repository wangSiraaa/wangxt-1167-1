package com.auction.deposit.controller;

import com.auction.deposit.common.Constants;
import com.auction.deposit.common.CurrentUser;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.common.Result;
import com.auction.deposit.dto.RefundApplyDTO;
import com.auction.deposit.dto.RefundAuditDTO;
import com.auction.deposit.entity.RefundApply;
import com.auction.deposit.service.RefundService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "退款管理")
@RestController
@RequestMapping("/refund")
public class RefundController {

    @Autowired
    private RefundService refundService;

    @ApiOperation("退款申请列表")
    @GetMapping("/list")
    public Result<PageResult<RefundApply>> list(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_NUM) Long current,
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_SIZE) Long size,
            @RequestParam(required = false) Long depositId,
            @RequestParam(required = false) String applyStatus,
            @RequestParam(required = false) String refundNo) {
        PageResult<RefundApply> page = new PageResult<>();
        page.setCurrent(current);
        page.setSize(size);
        RefundApply refund = new RefundApply();
        refund.setDepositId(depositId);
        refund.setApplyStatus(applyStatus);
        refund.setRefundNo(refundNo);
        PageResult<RefundApply> result = refundService.getRefundList(page, refund);
        return Result.success(result);
    }

    @ApiOperation("退款详情")
    @GetMapping("/{id}")
    public Result<RefundApply> getById(@PathVariable Long id) {
        RefundApply refund = refundService.getRefundById(id);
        return Result.success(refund);
    }

    @ApiOperation("发起退款申请")
    @PostMapping("/apply")
    public Result<RefundApply> apply(@RequestBody RefundApplyDTO dto) {
        RefundApply refund = new RefundApply();
        BeanUtils.copyProperties(dto, refund);
        RefundApply result = refundService.applyRefund(dto.getDepositId(), CurrentUser.getUserId(), refund);
        return Result.success(result);
    }

    @ApiOperation("审核退款")
    @PutMapping("/audit")
    public Result<Void> audit(@RequestBody RefundAuditDTO dto) {
        refundService.auditRefund(dto.getRefundId(), CurrentUser.getUserId(), dto.getPass(), dto.getAuditRemark());
        return Result.success();
    }

    @ApiOperation("确认退款完成")
    @PutMapping("/complete")
    public Result<Void> complete(@RequestParam Long refundId, @RequestParam String payOrderNo) {
        refundService.completeRefund(refundId, payOrderNo);
        return Result.success();
    }

    @ApiOperation("我的退款")
    @GetMapping("/myRefund")
    public Result<List<RefundApply>> myRefund() {
        List<RefundApply> list = refundService.getMyRefund(CurrentUser.getUserId());
        return Result.success(list);
    }
}
