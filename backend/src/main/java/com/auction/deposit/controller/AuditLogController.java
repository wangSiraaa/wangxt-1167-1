package com.auction.deposit.controller;

import com.auction.deposit.common.Constants;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.common.Result;
import com.auction.deposit.entity.AuditLog;
import com.auction.deposit.service.AuditLogService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Api(tags = "审核日志")
@RestController
@RequestMapping("/system/audit")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @ApiOperation("审核日志列表")
    @GetMapping("/list")
    public Result<PageResult<AuditLog>> list(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_NUM) Long current,
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE_SIZE) Long size,
            AuditLog auditLog) {
        PageResult<AuditLog> page = new PageResult<>();
        page.setCurrent(current);
        page.setSize(size);
        PageResult<AuditLog> result = auditLogService.getAuditList(page, auditLog);
        return Result.success(result);
    }
}
