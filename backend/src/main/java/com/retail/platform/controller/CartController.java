package com.retail.platform.controller;

import com.retail.platform.service.CartService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    private Long getAuthUserId(HttpServletRequest request) {
        Object attr = request.getAttribute("auth_user_id");
        if (attr instanceof Long) {
            return (Long) attr;
        } else if (attr instanceof Number) {
            return ((Number) attr).longValue();
        }
        return null;
    }

    /**
     * Get store-specific cart for the authenticated customer.
     */
    @GetMapping
    public ResponseEntity<?> getCart(@RequestParam(name = "storeId") Long storeId, HttpServletRequest request) {
        Long customerId = getAuthUserId(request);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "401 Unauthorized: Valid authentication token required."));
        }

        try {
            Map<String, Object> summary = cartService.getCartSummary(customerId, storeId);
            return ResponseEntity.ok(summary);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Add item to the store-specific cart.
     */
    @PostMapping("/items")
    public ResponseEntity<?> addItem(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        Long customerId = getAuthUserId(request);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "401 Unauthorized: Valid authentication token required."));
        }

        try {
            Long storeId = Long.valueOf(body.get("storeId").toString());
            Long storeProductId = Long.valueOf(body.get("storeProductId").toString());
            int quantity = body.containsKey("quantity") ? Integer.parseInt(body.get("quantity").toString()) : 1;

            cartService.addItem(customerId, storeId, storeProductId, quantity);
            Map<String, Object> summary = cartService.getCartSummary(customerId, storeId);
            return ResponseEntity.ok(summary);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update quantity of an item in the customer's cart.
     */
    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateItemQuantity(
            @PathVariable Long itemId,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        Long customerId = getAuthUserId(request);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "401 Unauthorized: Valid authentication token required."));
        }

        try {
            int quantity = Integer.parseInt(body.get("quantity").toString());
            cartService.updateQuantity(customerId, itemId, quantity);
            return ResponseEntity.ok(Map.of("success", true, "message", "Cart item updated"));
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Remove an item from the customer's cart.
     */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeItem(@PathVariable Long itemId, HttpServletRequest request) {
        Long customerId = getAuthUserId(request);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "401 Unauthorized: Valid authentication token required."));
        }

        try {
            cartService.removeItem(customerId, itemId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Item removed from cart"));
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Clear all items in a store-specific cart (e.g. after successful checkout).
     */
    @DeleteMapping
    public ResponseEntity<?> clearCart(@RequestParam(name = "storeId") Long storeId, HttpServletRequest request) {
        Long customerId = getAuthUserId(request);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "401 Unauthorized: Valid authentication token required."));
        }

        try {
            cartService.clearCart(customerId, storeId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Store cart cleared"));
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
