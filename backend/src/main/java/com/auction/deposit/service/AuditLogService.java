package com.auction.deposit.service;

import com.auction.deposit.common.PageResult;
import com.auction.deposit.entity.AuditLog;

public interface AuditLogService {

    void saveLog(AuditLog auditLog);

    void logAudit(String bizType, Long bizId, String bizNo, String operateType,
                  String operateDesc, String beforeStatus, String afterStatus, String remark);

    PageResult<AuditLog> getAuditList(PageResult<AuditLog> page, AuditLog auditLog);
}
