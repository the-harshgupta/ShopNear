package com.retail.platform.repository;

import com.retail.platform.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByOrderByCreatedAtDesc();
    List<Order> findByStatusOrderByCreatedAtDesc(String status);
    Optional<Order> findByPickupCode(String pickupCode);
    Optional<Order> findByOrderNumber(String orderNumber);
}
