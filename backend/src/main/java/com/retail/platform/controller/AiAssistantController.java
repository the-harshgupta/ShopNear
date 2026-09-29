package com.retail.platform.controller;

import com.retail.platform.model.AiAuditLog;
import com.retail.platform.model.Role;
import com.retail.platform.model.Store;
import com.retail.platform.service.AiInventoryAssistantService;
import com.retail.platform.service.ProductImageSearchService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shopkeeper/ai-assistant")
@CrossOrigin(origins = "*")
public class AiAssistantController {

    private final AiInventoryAssistantService aiAssistantService;
    private final ProductImageSearchService productImageSearchService;

    public AiAssistantController(AiInventoryAssistantService aiAssistantService,
                                ProductImageSearchService productImageSearchService) {
        this.aiAssistantService = aiAssistantService;
        this.productImageSearchService = productImageSearchService;
    }

    /**
     * Submit a natural language or voice command to the AI Assistant.
     */
    @PostMapping("/command")
    public ResponseEntity<?> handleCommand(@RequestBody Map<String, String> body, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("auth_user_id");
        Role role = (Role) request.getAttribute("auth_role");
        Long storeId = (Long) request.getAttribute("auth_store_id");

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "401 Unauthorized: Valid authentication token required."));
        }

        String command = body.get("command");
        if (command == null || command.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Command text is required"));
        }

        try {
            Map<String, Object> result = aiAssistantService.processCommand(command, userId, role, storeId);
            return ResponseEntity.ok(result);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "AI Assistant could not process command: " + e.getMessage()));
        }
    }

    /**
     * Confirm and execute a pending mutation action (ADD_STOCK, REDUCE_STOCK, DELETE_PRODUCT, etc.)
     */
    @PostMapping("/confirm")
    public ResponseEntity<?> executeConfirmed(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("auth_user_id");
        Role role = (Role) request.getAttribute("auth_role");
        Long storeId = (Long) request.getAttribute("auth_store_id");

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "401 Unauthorized: Valid authentication token required."));
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> pendingAction = (Map<String, Object>) body.get("pendingAction");
        if (pendingAction == null && body.get("action") instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> actionMap = (Map<String, Object>) body.get("action");
            pendingAction = actionMap;
        }
        if (pendingAction == null) {
            pendingAction = body; // fallback if sent directly
        }

        try {
            Map<String, Object> result = aiAssistantService.executeConfirmedAction(pendingAction, userId, role, storeId);
            return ResponseEntity.ok(result);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to execute action: " + e.getMessage()));
        }
    }

    /**
     * Fetch recent AI action audit logs for the authenticated shopkeeper's store.
     */
    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("auth_user_id");
        Role role = (Role) request.getAttribute("auth_role");
        Long storeId = (Long) request.getAttribute("auth_store_id");

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "401 Unauthorized"));
        }

        try {
            Store store = aiAssistantService.resolveAuthenticatedStore(userId, role, storeId);
            List<AiAuditLog> logs = aiAssistantService.getStoreAuditLogs(store.getId());
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check AI Assistant status and active store info.
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStatus(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("auth_user_id");
        Role role = (Role) request.getAttribute("auth_role");
        Long storeId = (Long) request.getAttribute("auth_store_id");

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "401 Unauthorized"));
        }

        try {
            Store store = aiAssistantService.resolveAuthenticatedStore(userId, role, storeId);
            return ResponseEntity.ok(Map.of(
                    "status", "ONLINE",
                    "storeId", store.getId(),
                    "storeName", store.getName(),
                    "ownerName", store.getOwnerName() != null ? store.getOwnerName() : "Shopkeeper",
                    "version", "1.0.0"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Search product images from internet and retail library for shopkeeper product photo selection.
     */
    @GetMapping("/product-images")
    public ResponseEntity<?> searchProductImages(
            @RequestParam(name = "query", defaultValue = "") String query,
            @RequestParam(name = "brand", required = false) String brand,
            @RequestParam(name = "packageSize", required = false) String packageSize,
            @RequestParam(name = "category", required = false) String category) {
        List<com.retail.platform.model.ProductImageResult> detailed =
                productImageSearchService.searchProductImagesDetailed(query, brand, packageSize, category);
        List<String> images = detailed.stream()
                .map(com.retail.platform.model.ProductImageResult::getImageUrl)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(Map.of(
                "query", query,
                "images", images,
                "candidateImageResults", detailed,
                "results", detailed,
                "reliableImagesFound", !detailed.isEmpty()
        ));
    }
}
