package com.retail.platform.repository;

import com.retail.platform.model.AiAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiAuditLogRepository extends JpaRepository<AiAuditLog, Long> {
    List<AiAuditLog> findByStoreIdOrderByTimestampDesc(Long storeId);
}
