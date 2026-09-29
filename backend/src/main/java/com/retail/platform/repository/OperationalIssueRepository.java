package com.retail.platform.repository;

import com.retail.platform.model.OperationalIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperationalIssueRepository extends JpaRepository<OperationalIssue, Long> {
    List<OperationalIssue> findByOrderByCreatedAtDesc();
    List<OperationalIssue> findByStatusOrderByCreatedAtDesc(String status);
}
