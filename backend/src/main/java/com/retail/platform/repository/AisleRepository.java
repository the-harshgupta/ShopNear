package com.retail.platform.repository;

import com.retail.platform.model.Aisle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AisleRepository extends JpaRepository<Aisle, Long> {
    List<Aisle> findBySectionId(Long sectionId);
}
