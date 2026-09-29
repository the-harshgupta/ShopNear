package com.retail.platform.repository;

import com.retail.platform.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<Notification> findByIdAndCustomerId(Long id, Long customerId);

    boolean existsByOrderIdAndNotificationType(Long orderId, String notificationType);

    long countByCustomerIdAndIsReadFalse(Long customerId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.customerId = :customerId AND n.isRead = false")
    void markAllAsReadByCustomerId(@Param("customerId") Long customerId);
}
