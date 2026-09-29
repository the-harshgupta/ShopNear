package com.retail.platform.controller;

import com.retail.platform.model.StoreReview;
import com.retail.platform.service.StoreReviewService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stores/{storeId}")
@CrossOrigin(origins = "*")
public class StoreReviewController {

    private final StoreReviewService storeReviewService;

    public StoreReviewController(StoreReviewService storeReviewService) {
        this.storeReviewService = storeReviewService;
    }

    @PostMapping("/reviews")
    public ResponseEntity<?> submitReview(
            @PathVariable Long storeId,
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {

        Long authUserId = (Long) request.getAttribute("auth_user_id");
        if (authUserId == null) {
            // Check if userId is passed in payload for testing/development fallback
            if (payload.containsKey("userId") && payload.get("userId") != null) {
                authUserId = Long.valueOf(payload.get("userId").toString());
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication is required to rate and review a store."));
            }
        }

        if (!payload.containsKey("rating") || payload.get("rating") == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Rating is required (1-5 stars)."));
        }

        Integer rating = Integer.valueOf(payload.get("rating").toString());
        Long orderId = payload.containsKey("orderId") && payload.get("orderId") != null
                ? Long.valueOf(payload.get("orderId").toString())
                : null;
        String reviewText = payload.containsKey("reviewText") && payload.get("reviewText") != null
                ? payload.get("reviewText").toString()
                : "";

        try {
            StoreReview review = storeReviewService.submitReview(storeId, authUserId, orderId, rating, reviewText);
            return ResponseEntity.status(HttpStatus.CREATED).body(review);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to submit review: " + e.getMessage()));
        }
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<StoreReview>> getStoreReviews(@PathVariable Long storeId) {
        return ResponseEntity.ok(storeReviewService.getStoreReviews(storeId));
    }

    @GetMapping("/rating")
    public ResponseEntity<Map<String, Object>> getStoreRating(@PathVariable Long storeId) {
        return ResponseEntity.ok(storeReviewService.getStoreRatingSummary(storeId));
    }

    @GetMapping("/reviews/eligibility")
    public ResponseEntity<?> checkEligibility(
            @PathVariable Long storeId,
            @RequestParam Long orderId,
            @RequestParam(required = false) Long customerId,
            HttpServletRequest request) {
        Long authUserId = (Long) request.getAttribute("auth_user_id");
        if (authUserId == null && customerId != null) {
            authUserId = customerId;
        }
        if (authUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication is required."));
        }
        return ResponseEntity.ok(storeReviewService.checkRatingEligibility(storeId, authUserId, orderId));
    }
}
