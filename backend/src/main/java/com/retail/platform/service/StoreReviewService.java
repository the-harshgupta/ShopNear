package com.retail.platform.service;

import com.retail.platform.model.Order;
import com.retail.platform.model.Store;
import com.retail.platform.model.StoreReview;
import com.retail.platform.model.User;
import com.retail.platform.repository.OrderRepository;
import com.retail.platform.repository.StoreRepository;
import com.retail.platform.repository.StoreReviewRepository;
import com.retail.platform.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class StoreReviewService {

    private final StoreReviewRepository storeReviewRepository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public StoreReviewService(
            StoreReviewRepository storeReviewRepository,
            StoreRepository storeRepository,
            UserRepository userRepository,
            OrderRepository orderRepository) {
        this.storeReviewRepository = storeReviewRepository;
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public StoreReview submitReview(Long storeId, Long userId, Long orderId, Integer rating, String reviewText) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5 stars.");
        }

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found with ID: " + storeId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        // Prevent store owners / managers from fabricating reviews for their own store
        if (store.getOwner() != null && store.getOwner().getId().equals(userId)) {
            throw new SecurityException("Store owners and managers cannot rate their own store.");
        }

        if (orderId == null) {
            throw new IllegalArgumentException("A verified completed pickup order is required to rate a store.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        // 1. Verify order belongs to customer
        if (order.getCustomerId() != null && !order.getCustomerId().equals(userId)) {
            throw new SecurityException("You can only review purchases that you have completed.");
        }

        // 2. Verify order belongs to this store
        if (order.getStoreId() != null && !order.getStoreId().equals(storeId)) {
            throw new IllegalArgumentException("This purchase does not belong to the selected store.");
        }

        // 3. Verify payment was successful (not failed or cancelled)
        if ("FAILED".equalsIgnoreCase(order.getPaymentStatus()) || "CANCELLED".equalsIgnoreCase(order.getStatus()) || "CANCELLED".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new IllegalArgumentException("Rating is not available for cancelled or unpaid orders.");
        }

        // 4. CRITICAL RULE: PAYMENT != RATING ELIGIBILITY
        // Customer is eligible to rate ONLY AFTER physical pickup is completed (status is PICKED_UP or COMPLETED)
        boolean isPickedUp = "PICKED_UP".equalsIgnoreCase(order.getStatus()) || "COMPLETED".equalsIgnoreCase(order.getStatus());
        if (!isPickedUp) {
            throw new IllegalArgumentException("Rating is available after your order has been picked up.");
        }

        // 5. Prevent duplicate ratings for the same order
        if (storeReviewRepository.existsByCustomerIdAndOrderId(userId, orderId)) {
            throw new IllegalArgumentException("Rating already submitted for this order.");
        }

        StoreReview review = new StoreReview(
                store,
                user,
                orderId,
                order.getOrderNumber(),
                rating,
                reviewText != null ? reviewText.trim() : "",
                user.getFullName()
        );

        return storeReviewRepository.save(review);
    }

    public Map<String, Object> checkRatingEligibility(Long storeId, Long userId, Long orderId) {
        Map<String, Object> result = new HashMap<>();
        result.put("orderId", orderId);
        result.put("storeId", storeId);

        if (orderId == null) {
            result.put("eligible", false);
            result.put("reason", "Order ID is required.");
            return result;
        }

        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            result.put("eligible", false);
            result.put("reason", "Order not found.");
            return result;
        }
        Order order = orderOpt.get();

        if (order.getCustomerId() != null && !order.getCustomerId().equals(userId)) {
            result.put("eligible", false);
            result.put("reason", "You can only review purchases that you have completed.");
            return result;
        }

        if (order.getStoreId() != null && !order.getStoreId().equals(storeId)) {
            result.put("eligible", false);
            result.put("reason", "This purchase does not belong to the selected store.");
            return result;
        }

        if ("FAILED".equalsIgnoreCase(order.getPaymentStatus()) || "CANCELLED".equalsIgnoreCase(order.getStatus()) || "CANCELLED".equalsIgnoreCase(order.getPaymentStatus())) {
            result.put("eligible", false);
            result.put("reason", "Rating is not available for cancelled or unpaid orders.");
            return result;
        }

        boolean isPickedUp = "PICKED_UP".equalsIgnoreCase(order.getStatus()) || "COMPLETED".equalsIgnoreCase(order.getStatus());
        if (!isPickedUp) {
            result.put("eligible", false);
            result.put("reason", "Rating is available after your order has been picked up.");
            return result;
        }

        boolean alreadyRated = storeReviewRepository.existsByCustomerIdAndOrderId(userId, orderId);
        if (alreadyRated) {
            result.put("eligible", false);
            result.put("alreadyRated", true);
            result.put("reason", "Rating already submitted for this order.");
            return result;
        }

        result.put("eligible", true);
        result.put("alreadyRated", false);
        result.put("reason", "Order has been picked up and is eligible for rating.");
        return result;
    }

    public List<StoreReview> getStoreReviews(Long storeId) {
        return storeReviewRepository.findByStoreIdOrderByCreatedAtDesc(storeId);
    }

    public Map<String, Object> getStoreRatingSummary(Long storeId) {
        Store store = storeRepository.findById(storeId).orElse(null);
        String storeName = store != null ? store.getName() : "Store";

        List<StoreReview> reviews = storeReviewRepository.findByStoreIdOrderByCreatedAtDesc(storeId);
        long totalReviews = reviews.size();

        double avg = 0.0;
        if (totalReviews > 0) {
            avg = reviews.stream().mapToInt(StoreReview::getRating).average().orElse(0.0);
            avg = Math.round(avg * 10.0) / 10.0;
        }

        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int star = 5; star >= 1; star--) {
            final int s = star;
            long count = reviews.stream().filter(r -> r.getRating() == s).count();
            distribution.put(star, count);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("storeId", storeId);
        result.put("storeName", storeName);
        result.put("averageRating", avg);
        result.put("totalReviews", totalReviews);
        result.put("ratingDistribution", distribution);
        result.put("recentReviews", reviews.size() > 10 ? reviews.subList(0, 10) : reviews);

        return result;
    }
}
