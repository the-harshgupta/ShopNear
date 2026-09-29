package com.retail.platform.repository;

import com.retail.platform.model.StoreReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreReviewRepository extends JpaRepository<StoreReview, Long> {

    List<StoreReview> findByStoreIdOrderByCreatedAtDesc(Long storeId);

    List<StoreReview> findByStoreId(Long storeId);

    List<StoreReview> findByCustomerId(Long customerId);

    Optional<StoreReview> findByOrderId(Long orderId);

    boolean existsByCustomerIdAndOrderId(Long customerId, Long orderId);

    boolean existsByOrderId(Long orderId);

    long countByStoreId(Long storeId);
}
