package com.retail.platform.service;

import com.retail.platform.model.Order;
import com.retail.platform.model.OrderItem;
import com.retail.platform.model.StoreProduct;
import com.retail.platform.repository.OrderRepository;
import com.retail.platform.repository.StoreProductRepository;
import com.retail.platform.repository.StoreReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final StoreProductRepository storeProductRepository;
    private final StoreReviewRepository storeReviewRepository;
    private final com.retail.platform.repository.StoreRepository storeRepository;
    private final NotificationService notificationService;
    private final com.retail.platform.repository.UserRepository userRepository;
    private final Random random = new Random();

    public OrderService(
            OrderRepository orderRepository,
            StoreProductRepository storeProductRepository,
            StoreReviewRepository storeReviewRepository,
            com.retail.platform.repository.StoreRepository storeRepository,
            NotificationService notificationService,
            com.retail.platform.repository.UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.storeProductRepository = storeProductRepository;
        this.storeReviewRepository = storeReviewRepository;
        this.storeRepository = storeRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    private Order enrichOrder(Order order) {
        if (order != null && order.getId() != null) {
            order.setIsRated(storeReviewRepository.existsByOrderId(order.getId()));
        }
        return order;
    }

    private List<Order> enrichOrders(List<Order> orders) {
        if (orders != null) {
            orders.forEach(this::enrichOrder);
        }
        return orders;
    }

    public List<Order> getAllOrders() {
        return enrichOrders(orderRepository.findByOrderByCreatedAtDesc());
    }

    public List<Order> getOrdersByStatus(String status) {
        if ("PICKED_UP".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
            List<Order> list = orderRepository.findByStatusOrderByCreatedAtDesc("PICKED_UP");
            list.addAll(orderRepository.findByStatusOrderByCreatedAtDesc("COMPLETED"));
            return enrichOrders(list);
        }
        return enrichOrders(orderRepository.findByStatusOrderByCreatedAtDesc(status));
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id).map(this::enrichOrder);
    }

    public Optional<Order> getOrderByPickupCode(String pickupCode) {
        return orderRepository.findByPickupCode(pickupCode).map(this::enrichOrder);
    }

    @Transactional
    public Order createPickupOrder(Order order) {
        double calculatedTotal = 0.0;

        // Pass 1: Validate stock for all items
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            for (OrderItem item : order.getItems()) {
                Long targetId = item.getProductId() != null ? item.getProductId() : item.getStoreProductId();
                if (targetId == null) {
                    throw new IllegalArgumentException("Product ID is required for each order item.");
                }
                StoreProduct sp = storeProductRepository.findById(targetId)
                        .orElseThrow(() -> new IllegalArgumentException("Store product not found with ID: " + targetId));

                int requestedQty = item.getQuantity() != null ? item.getQuantity() : 1;
                if (sp.getStockQuantity() < requestedQty) {
                    String name = sp.getProduct() != null ? sp.getProduct().getName() : "Item #" + targetId;
                    throw new IllegalArgumentException("Insufficient stock for " + name + ". Only " + sp.getStockQuantity() + " items are available.");
                }

                // Populate item details
                if (order.getStoreId() == null && sp.getStore() != null) {
                    order.setStoreId(sp.getStore().getId());
                }
                item.setProductId(sp.getId());
                if (item.getProductName() == null && sp.getProduct() != null) {
                    item.setProductName(sp.getProduct().getName());
                }
                if (item.getUnitPrice() == null) {
                    item.setUnitPrice(sp.getPrice());
                }
                if (item.getAisle() == null) {
                    item.setAisle(sp.getAisleNumber() != null ? sp.getAisleNumber() : "Main");
                }
                calculatedTotal += (item.getUnitPrice() * requestedQty);
            }
        }

        // Generate unique numbers
        order.setOrderNumber("ORD-" + (1000 + random.nextInt(9000)));
        order.setPickupCode("PKP-" + (100 + random.nextInt(900)));
        if (order.getStatus() == null || order.getStatus().trim().isEmpty() || "PAID".equalsIgnoreCase(order.getStatus())) {
            order.setStatus("PENDING");
        }
        if (order.getPaymentStatus() == null || order.getPaymentStatus().trim().isEmpty()) {
            order.setPaymentStatus("PAID");
        }
        order.setCreatedAtFormatted("Today, " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a")));
        order.setCreatedAt(LocalDateTime.now());
        if (order.getTotalAmount() == null || order.getTotalAmount() <= 0) {
            order.setTotalAmount(calculatedTotal);
        }

        // Pass 2: Deduct inventory stock
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Long targetId = item.getProductId();
                if (targetId != null) {
                    StoreProduct sp = storeProductRepository.findById(targetId).get();
                    int requestedQty = item.getQuantity() != null ? item.getQuantity() : 1;
                    sp.setStockQuantity(Math.max(0, sp.getStockQuantity() - requestedQty));
                    storeProductRepository.save(sp);
                }
            }
        }

        // Ensure customerId is assigned
        if (order.getCustomerId() == null && order.getCustomerPhone() != null) {
            userRepository.findByPhone(order.getCustomerPhone().trim())
                    .ifPresent(u -> order.setCustomerId(u.getId()));
        }
        if (order.getCustomerId() == null) {
            userRepository.findByEmail("customer@retail.com")
                    .ifPresent(u -> order.setCustomerId(u.getId()));
        }

        Order saved = orderRepository.save(order);
        if (saved.getStoreId() != null) {
            com.retail.platform.model.Store store = storeRepository.findById(saved.getStoreId()).orElse(null);
            notificationService.notifyOrderCreated(saved, store);
        }
        return enrichOrder(saved);
    }

    @Transactional
    public Optional<Order> updateStatus(Long orderId, String newStatus) {
        return updateStatus(orderId, newStatus, null);
    }

    @Transactional
    public Optional<Order> updateStatus(Long orderId, String newStatus, String estimatedPickupTime) {
        return orderRepository.findById(orderId).map(order -> {
            if (newStatus != null && !newStatus.trim().isEmpty()) {
                if ("PICKED_UP".equalsIgnoreCase(newStatus) || "COMPLETED".equalsIgnoreCase(newStatus)) {
                    order.setStatus("PICKED_UP");
                    if (order.getPickedUpAt() == null) {
                        order.setPickedUpAt(LocalDateTime.now());
                        order.setPickedUpAtFormatted("Today, " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a")));
                    }
                } else {
                    order.setStatus(newStatus);
                }
            }
            if (estimatedPickupTime != null && !estimatedPickupTime.trim().isEmpty()) {
                order.setEstimatedPickupTime(estimatedPickupTime);
            }
            Order saved = orderRepository.save(order);
            if (saved.getStoreId() != null) {
                com.retail.platform.model.Store store = storeRepository.findById(saved.getStoreId()).orElse(null);
                notificationService.notifyOrderStatusChanged(saved, store, saved.getStatus());
            }
            return enrichOrder(saved);
        });
    }

    @Transactional
    public Optional<Order> updatePaymentStatus(Long orderId, String paymentStatus) {
        return orderRepository.findById(orderId).map(order -> {
            if (paymentStatus != null && !paymentStatus.trim().isEmpty()) {
                order.setPaymentStatus(paymentStatus.toUpperCase().trim());
            }
            Order saved = orderRepository.save(order);
            return enrichOrder(saved);
        });
    }
}
