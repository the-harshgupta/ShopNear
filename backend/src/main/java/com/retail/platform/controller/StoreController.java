package com.retail.platform.controller;

import com.retail.platform.model.Store;
import com.retail.platform.model.StoreRatingDTO;
import com.retail.platform.model.StoreType;
import com.retail.platform.service.StoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
@CrossOrigin(origins = "*")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @GetMapping
    public List<Store> getAllStores(@RequestParam(required = false) String type) {
        if (type != null && !type.isEmpty()) {
            try {
                StoreType storeType = StoreType.valueOf(type.toUpperCase());
                return storeService.getStoresByType(storeType);
            } catch (IllegalArgumentException e) {
                return storeService.getAllStores();
            }
        }
        return storeService.getActiveStores();
    }

    /**
     * Endpoint to fetch Top Rated Grocery Stores ordered by averageRating DESC, reviewCount DESC.
     * Supports minimum review threshold parameter (default: 1).
     */
    @GetMapping("/top-rated")
    public List<StoreRatingDTO> getTopRatedStores(
            @RequestParam(required = false, defaultValue = "1") Integer minReviews,
            @RequestParam(required = false, defaultValue = "6") Integer limit) {
        return storeService.getTopRatedStores(minReviews != null ? minReviews : 1, limit);
    }

    /**
     * Endpoint to fetch all stores with computed ratings, review counts, availability metrics,
     * and multi-criteria sorting (rating, reviews, name, availability).
     */
    @GetMapping("/rated")
    public List<StoreRatingDTO> getStoresWithRatings(
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "rating") String sort,
            @RequestParam(required = false) String q) {

        StoreType storeType = null;
        if (type != null && !type.trim().isEmpty() && !type.equalsIgnoreCase("ALL")) {
            try {
                storeType = StoreType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        return storeService.getStoresWithRatings(storeType, sort, q);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Store> getStoreById(@PathVariable Long id) {
        return storeService.getStoreById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<StoreRatingDTO> getStoreSummaryById(@PathVariable Long id) {
        return storeService.getStoreById(id)
                .map(storeService::buildStoreRatingDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Store> searchStores(@RequestParam String q) {
        return storeService.searchStores(q);
    }

    @PostMapping
    public Store createStore(@RequestBody Store store,
                             @RequestParam(required = false) Long ownerId) {
        if (ownerId != null) {
            return storeService.createStore(store, ownerId);
        }
        return storeService.createStore(store);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStore(
            @PathVariable Long id, 
            @RequestBody Store store,
            jakarta.servlet.http.HttpServletRequest request) {

        com.retail.platform.model.Role authRole = (com.retail.platform.model.Role) request.getAttribute("auth_role");
        Long authUserId = (Long) request.getAttribute("auth_user_id");
        Long authStoreId = (Long) request.getAttribute("auth_store_id");

        if (authRole == com.retail.platform.model.Role.SHOPKEEPER || 
            authRole == com.retail.platform.model.Role.SUPERMARKET_MANAGER || 
            authRole == com.retail.platform.model.Role.STORE_MANAGER) {
            
            if (authStoreId != null && !authStoreId.equals(id)) {
                return ResponseEntity.status(403).body(java.util.Map.of("error", "403 Forbidden: You do not have permission to modify another store."));
            }
            if (authUserId != null) {
                java.util.Optional<Store> existingOpt = storeService.getStoreById(id);
                if (existingOpt.isPresent() && existingOpt.get().getOwner() != null) {
                    if (!existingOpt.get().getOwner().getId().equals(authUserId)) {
                        return ResponseEntity.status(403).body(java.util.Map.of("error", "403 Forbidden: You do not have permission to modify another store."));
                    }
                }
            }
        }

        try {
            Store updated = storeService.updateStore(id, store);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
