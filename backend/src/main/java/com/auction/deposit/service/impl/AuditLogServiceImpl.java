package com.auction.deposit.service.impl;

import com.auction.deposit.common.CurrentUser;
import com.auction.deposit.common.PageResult;
import com.auction.deposit.entity.AuditLog;
import com.auction.deposit.mapper.AuditLogMapper;
import com.auction.deposit.service.AuditLogService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    @Autowired
    private AuditLogMapper auditLogMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveLog(AuditLog auditLog) {
        if (auditLog.getOperatorId() == null) {
            auditLog.setOperatorId(CurrentUser.getUserId());
        }
        if (auditLog.getOperatorName() == null || auditLog.getOperatorName().isEmpty()) {
            auditLog.setOperatorName(CurrentUser.getUsername());
        }
        if (auditLog.getCreateTime() == null) {
            auditLog.setCreateTime(LocalDateTime.now());
        }
        auditLogMapper.insert(auditLog);
    }

    @Override
    public void logAudit(String bizType, Long bizId, String bizNo, String operateType,
                         String operateDesc, String beforeStatus, String afterStatus, String remark) {
        AuditLog auditLog = new AuditLog();
        auditLog.setBizType(bizType);
        auditLog.setBizId(bizId);
        auditLog.setBizNo(bizNo);
        auditLog.setOperateType(operateType);
        auditLog.setOperateDesc(operateDesc);
        auditLog.setBeforeStatus(beforeStatus);
        auditLog.setAfterStatus(afterStatus);
        auditLog.setOperatorId(CurrentUser.getUserId());
        auditLog.setOperatorName(CurrentUser.getUsername());
        auditLog.setRemark(remark);
        auditLog.setCreateTime(LocalDateTime.now());
        auditLogMapper.insert(auditLog);
    }

    @Override
    public PageResult<AuditLog> getAuditList(PageResult<AuditLog> page, AuditLog auditLog) {
        IPage<AuditLog> pageParam = new Page<>(page.getCurrent(), page.getSize());
        LambdaQueryWrapper<AuditLog> wrapper = new LambdaQueryWrapper<>();

        if (auditLog.getBizType() != null && !auditLog.getBizType().isEmpty()) {
            wrapper.eq(AuditLog::getBizType, auditLog.getBizType());
        }
        if (auditLog.getBizId() != null) {
            wrapper.eq(AuditLog::getBizId, auditLog.getBizId());
        }
        if (auditLog.getBizNo() != null && !auditLog.getBizNo().isEmpty()) {
            wrapper.like(AuditLog::getBizNo, auditLog.getBizNo());
        }
        if (auditLog.getOperateType() != null && !auditLog.getOperateType().isEmpty()) {
            wrapper.eq(AuditLog::getOperateType, auditLog.getOperateType());
        }
        if (auditLog.getOperatorId() != null) {
            wrapper.eq(AuditLog::getOperatorId, auditLog.getOperatorId());
        }
        if (auditLog.getOperatorName() != null && !auditLog.getOperatorName().isEmpty()) {
            wrapper.like(AuditLog::getOperatorName, auditLog.getOperatorName());
        }
        wrapper.orderByDesc(AuditLog::getCreateTime);

        IPage<AuditLog> result = auditLogMapper.selectPage(pageParam, wrapper);
        return PageResult.of(result.getTotal(), result.getPages(), result.getCurrent(), result.getSize(), result.getRecords());
    }
}
