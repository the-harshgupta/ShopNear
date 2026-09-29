package com.retail.platform.controller;

import com.retail.platform.model.Order;
import com.retail.platform.model.Role;
import com.retail.platform.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders(@RequestParam(required = false) String status) {
        if (status != null && !status.trim().isEmpty()) {
            return ResponseEntity.ok(orderService.getOrdersByStatus(status));
        }
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order order, HttpServletRequest request) {
        Long authUserId = (Long) request.getAttribute("auth_user_id");
        if (order.getCustomerId() == null && authUserId != null) {
            order.setCustomerId(authUserId);
        }
        try {
            return ResponseEntity.ok(orderService.createPickupOrder(order));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            HttpServletRequest request) {
        String status = payload.get("status");
        String estimatedPickupTime = payload.get("estimatedPickupTime");
        if (estimatedPickupTime == null) {
            estimatedPickupTime = payload.get("expectedTime");
        }
        if (status == null && estimatedPickupTime == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status or estimatedPickupTime is required"));
        }

        Optional<Order> orderOpt = orderService.getOrderById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Order order = orderOpt.get();

        // Security check: Only authorized shopkeeper/supermarket manager of THIS store (or admin) can update status
        Role role = (Role) request.getAttribute("auth_role");
        Long authStoreId = (Long) request.getAttribute("auth_store_id");

        if (role == null && payload.containsKey("userRole")) {
            try { role = Role.valueOf(payload.get("userRole")); } catch (Exception ignored) {}
        }
        if (authStoreId == null && payload.containsKey("storeId")) {
            try { authStoreId = Long.valueOf(payload.get("storeId")); } catch (Exception ignored) {}
        }

        if (role != null) {
            if (role == Role.CUSTOMER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Customers are not authorized to update order pickup status."));
            }
            if (role == Role.SHOPKEEPER || role == Role.SUPERMARKET_MANAGER) {
                if (authStoreId != null && order.getStoreId() != null && !authStoreId.equals(order.getStoreId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "You are not authorized to manage orders for another store."));
                }
            }
        }

        return orderService.updateStatus(id, status, estimatedPickupTime)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String paymentStatus = payload.get("paymentStatus");
        if (paymentStatus == null || paymentStatus.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "paymentStatus is required"));
        }
        return orderService.updatePaymentStatus(id, paymentStatus)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        return orderService.updateStatus(id, "CANCELLED")
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/pickup/{code}")
    public ResponseEntity<Order> getOrderByPickupCode(@PathVariable String code) {
        return orderService.getOrderByPickupCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
