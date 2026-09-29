package com.retail.platform.controller;

import com.retail.platform.model.Notification;
import com.retail.platform.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/notifications")
@CrossOrigin(origins = "*")
public class CustomerNotificationController {

    private final NotificationService notificationService;

    public CustomerNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
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
     * Retrieve all notifications for the authenticated customer.
     */
    @GetMapping
    public ResponseEntity<?> getNotifications(HttpServletRequest request) {
        Long customerId = getAuthUserId(request);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "401 Unauthorized: Valid customer authentication token required."));
        }

        List<Notification> list = notificationService.getCustomerNotifications(customerId);
        return ResponseEntity.ok(list);
    }

    /**
     * Retrieve the count of unread notifications for the authenticated customer.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(HttpServletRequest request) {
        Long customerId = getAuthUserId(request);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "401 Unauthorized: Valid customer authentication token required."));
        }

        long unreadCount = notificationService.getUnreadCount(customerId);
        return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
    }

    /**
     * Mark a specific notification as read.
     * Enforces strict customer ownership verification.
     */
    @RequestMapping(value = "/{id}/read", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<?> markAsRead(@PathVariable Long id, HttpServletRequest request) {
        Long customerId = getAuthUserId(request);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "401 Unauthorized: Valid customer authentication token required."));
        }

        try {
            Notification updated = notificationService.markAsRead(customerId, id);
            return ResponseEntity.ok(updated);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", iae.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Mark all notifications as read for the authenticated customer.
     */
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(HttpServletRequest request) {
        Long customerId = getAuthUserId(request);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "401 Unauthorized: Valid customer authentication token required."));
        }

        notificationService.markAllAsRead(customerId);
        return ResponseEntity.ok(Map.of("success", true, "message", "All notifications marked as read."));
    }
}
