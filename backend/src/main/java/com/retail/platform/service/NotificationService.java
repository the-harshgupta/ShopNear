package com.retail.platform.service;

import com.retail.platform.model.Notification;
import com.retail.platform.model.Order;
import com.retail.platform.model.Store;
import com.retail.platform.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Creates an idempotent notification. If a notification for the same order and status
     * transition type already exists, it is not duplicated.
     */
    public Notification createNotification(Long customerId, Long orderId, String orderNumber,
                                           Long storeId, String storeName,
                                           String title, String message, String type) {
        if (customerId == null) {
            log.debug("Skipping notification creation: customerId is null");
            return null;
        }

        // Idempotency check: prevent duplicate notifications for the same order transition
        if (orderId != null && notificationRepository.existsByOrderIdAndNotificationType(orderId, type)) {
            log.debug("Notification for orderId {} and type {} already exists. Skipping duplicate.", orderId, type);
            return null;
        }

        Notification notification = new Notification(
                customerId,
                orderId,
                orderNumber,
                storeId,
                storeName,
                title,
                message,
                type
        );

        Notification saved = notificationRepository.save(notification);
        log.info("Created notification [{}] for customer {}: {}", type, customerId, title);
        return saved;
    }

    /**
     * Generates a PAYMENT_SUCCESS notification when an order is confirmed.
     */
    public void notifyOrderCreated(Order order, Store store) {
        if (order == null || order.getCustomerId() == null) return;

        String storeName = store != null ? store.getName() : "the store";
        String orderNum = order.getOrderNumber() != null ? order.getOrderNumber() : ("#" + order.getId());

        createNotification(
                order.getCustomerId(),
                order.getId(),
                orderNum,
                order.getStoreId(),
                storeName,
                "Payment Successful",
                "Payment for order " + orderNum + " was successful.",
                "PAYMENT_SUCCESS"
        );
    }

    /**
     * Generates notifications for order status transitions.
     */
    public void notifyOrderStatusChanged(Order order, Store store, String newStatus) {
        if (order == null || order.getCustomerId() == null || newStatus == null) return;

        String storeName = store != null ? store.getName() : "the store";
        String orderNum = order.getOrderNumber() != null ? order.getOrderNumber() : ("#" + order.getId());
        String normalized = newStatus.toUpperCase().trim();

        switch (normalized) {
            case "ACCEPTED":
                createNotification(
                        order.getCustomerId(),
                        order.getId(),
                        orderNum,
                        order.getStoreId(),
                        storeName,
                        "Order Accepted",
                        "Your order " + orderNum + " has been accepted by " + storeName + ".",
                        "ORDER_ACCEPTED"
                );
                break;

            case "READY_FOR_PICKUP":
                createNotification(
                        order.getCustomerId(),
                        order.getId(),
                        orderNum,
                        order.getStoreId(),
                        storeName,
                        "Order Ready",
                        "Your order " + orderNum + " is ready for pickup.",
                        "ORDER_READY"
                );
                break;

            case "PICKED_UP":
            case "COMPLETED":
                createNotification(
                        order.getCustomerId(),
                        order.getId(),
                        orderNum,
                        order.getStoreId(),
                        storeName,
                        "Order Picked Up",
                        "Your order " + orderNum + " has been successfully picked up.",
                        "ORDER_PICKED_UP"
                );
                break;

            case "CANCELLED":
                createNotification(
                        order.getCustomerId(),
                        order.getId(),
                        orderNum,
                        order.getStoreId(),
                        storeName,
                        "Order Cancelled",
                        "Your order " + orderNum + " has been cancelled.",
                        "ORDER_CANCELLED"
                );
                break;

            default:
                log.debug("No customer notification mapped for status: {}", normalized);
                break;
        }
    }

    @Transactional(readOnly = true)
    public List<Notification> getCustomerNotifications(Long customerId) {
        if (customerId == null) return List.of();
        return notificationRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long customerId) {
        if (customerId == null) return 0;
        return notificationRepository.countByCustomerIdAndIsReadFalse(customerId);
    }

    public Notification markAsRead(Long customerId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with id: " + notificationId));

        if (!notification.getCustomerId().equals(customerId)) {
            throw new SecurityException("Forbidden: You are not authorized to access this notification");
        }

        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(Long customerId) {
        if (customerId != null) {
            notificationRepository.markAllAsReadByCustomerId(customerId);
        }
    }
}
