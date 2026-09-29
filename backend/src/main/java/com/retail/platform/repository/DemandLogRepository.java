package com.retail.platform.repository;

import com.retail.platform.model.DemandLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DemandLogRepository extends JpaRepository<DemandLog, Long> {
    Optional<DemandLog> findByProductId(Long productId);
    List<DemandLog> findByOrderByMissedSearchesCountDesc();
}
