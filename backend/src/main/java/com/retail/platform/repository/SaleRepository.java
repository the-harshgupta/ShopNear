package com.retail.platform.repository;

import com.retail.platform.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findByStoreIdOrderBySaleDateDesc(Long storeId);

    @Query("SELECT s FROM Sale s WHERE s.store.id = :storeId AND s.saleDate >= :since ORDER BY s.saleDate DESC")
    List<Sale> findByStoreIdAndSaleDateAfter(Long storeId, LocalDateTime since);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.store.id = :storeId AND s.saleDate >= :since")
    Double sumTotalByStoreIdSince(Long storeId, LocalDateTime since);

    long countByStoreId(Long storeId);
}
