package com.retail.platform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderNumber;

    private String customerName;

    private String customerPhone;

    @Column(nullable = false)
    private String pickupCode;

    private Double totalAmount;

    @Column(nullable = false)
    private String status; // PENDING, ACCEPTED, READY_FOR_PICKUP, PICKED_UP, COMPLETED, CANCELLED

    private String estimatedPickupTime;

    private String createdAtFormatted;

    private LocalDateTime createdAt;

    private LocalDateTime pickedUpAt;

    private String pickedUpAtFormatted;

    private String paymentStatus; // PAID, PENDING, FAILED, CANCELLED

    @Transient
    private Boolean isRated = false;

    private Long storeId;

    private Long customerId;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items = new ArrayList<>();

    public Order() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getPickupCode() { return pickupCode; }
    public void setPickupCode(String pickupCode) { this.pickupCode = pickupCode; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getEstimatedPickupTime() { return estimatedPickupTime; }
    public void setEstimatedPickupTime(String estimatedPickupTime) { this.estimatedPickupTime = estimatedPickupTime; }

    public String getCreatedAtFormatted() { return createdAtFormatted; }
    public void setCreatedAtFormatted(String createdAtFormatted) { this.createdAtFormatted = createdAtFormatted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public LocalDateTime getPickedUpAt() { return pickedUpAt; }
    public void setPickedUpAt(LocalDateTime pickedUpAt) { this.pickedUpAt = pickedUpAt; }

    public String getPickedUpAtFormatted() { return pickedUpAtFormatted; }
    public void setPickedUpAtFormatted(String pickedUpAtFormatted) { this.pickedUpAtFormatted = pickedUpAtFormatted; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public Boolean getIsRated() { return isRated; }
    public void setIsRated(Boolean isRated) { this.isRated = isRated; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}
