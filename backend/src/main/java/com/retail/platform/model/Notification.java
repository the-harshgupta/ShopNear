package com.retail.platform.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "customer_notifications",
        indexes = {
                @Index(name = "idx_cust_notif_customer", columnList = "customerId"),
                @Index(name = "idx_cust_notif_order", columnList = "orderId")
        }
)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private Long customerId;

    private Long orderId;

    private String orderNumber;

    private Long storeId;

    private String storeName;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @NotBlank
    @Column(length = 1000, nullable = false)
    private String message;

    @NotBlank
    @Column(nullable = false)
    private String notificationType; // ORDER_ACCEPTED, ORDER_READY, ORDER_PICKED_UP, ORDER_CANCELLED, PAYMENT_SUCCESS, PAYMENT_FAILED

    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Notification() {
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    public Notification(Long customerId, Long orderId, String orderNumber, Long storeId, String storeName, String title, String message, String notificationType) {
        this.customerId = customerId;
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.storeId = storeId;
        this.storeName = storeName;
        this.title = title;
        this.message = message;
        this.notificationType = notificationType;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.isRead == null) {
            this.isRead = false;
        }
    }

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
