package com.retail.platform.service;

import com.retail.platform.model.Store;
import com.retail.platform.model.StoreProduct;
import com.retail.platform.model.StoreRatingDTO;
import com.retail.platform.model.StoreReview;
import com.retail.platform.model.StoreType;
import com.retail.platform.repository.StoreProductRepository;
import com.retail.platform.repository.StoreRepository;
import com.retail.platform.repository.StoreReviewRepository;
import com.retail.platform.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final StoreReviewRepository storeReviewRepository;
    private final StoreProductRepository storeProductRepository;

    public StoreService(
            StoreRepository storeRepository,
            UserRepository userRepository,
            StoreReviewRepository storeReviewRepository,
            StoreProductRepository storeProductRepository) {
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
        this.storeReviewRepository = storeReviewRepository;
        this.storeProductRepository = storeProductRepository;
    }

    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    public List<Store> getActiveStores() {
        return storeRepository.findByIsActiveTrue();
    }

    public Optional<Store> getStoreById(Long id) {
        return storeRepository.findById(id);
    }

    public List<Store> getStoresByType(StoreType type) {
        return storeRepository.findByType(type);
    }

    public List<Store> searchStores(String query) {
        return storeRepository.searchByName(query);
    }

    public List<Store> getStoresByOwner(Long ownerId) {
        return storeRepository.findByOwnerId(ownerId);
    }

    @Transactional
    public Store createStore(Store store) {
        return storeRepository.save(store);
    }

    @Transactional
    public Store createStore(Store store, Long ownerId) {
        if (ownerId != null) {
            userRepository.findById(ownerId).ifPresent(store::setOwner);
        }
        return storeRepository.save(store);
    }

    @Transactional
    public Store updateStore(Long id, Store updatedStore) {
        return storeRepository.findById(id).map(store -> {
            if (updatedStore.getName() != null) store.setName(updatedStore.getName());
            if (updatedStore.getType() != null) store.setType(updatedStore.getType());
            if (updatedStore.getOwnerName() != null) store.setOwnerName(updatedStore.getOwnerName());
            if (updatedStore.getAddress() != null) store.setAddress(updatedStore.getAddress());
            if (updatedStore.getCity() != null) store.setCity(updatedStore.getCity());
            if (updatedStore.getState() != null) store.setState(updatedStore.getState());
            if (updatedStore.getPincode() != null) store.setPincode(updatedStore.getPincode());
            if (updatedStore.getPhone() != null) store.setPhone(updatedStore.getPhone());
            if (updatedStore.getEmail() != null) store.setEmail(updatedStore.getEmail());
            if (updatedStore.getDescription() != null) store.setDescription(updatedStore.getDescription());
            return storeRepository.save(store);
        }).orElseThrow(() -> new RuntimeException("Store not found with id: " + id));
    }

    @Transactional
    public void deactivateStore(Long id) {
        storeRepository.findById(id).ifPresent(store -> {
            store.setIsActive(false);
            storeRepository.save(store);
        });
    }

    // --- Dynamic Rating and Top Stores Computation ---

    public StoreRatingDTO buildStoreRatingDTO(Store store) {
        List<StoreReview> reviews = storeReviewRepository.findByStoreId(store.getId());
        Double averageRating = null;
        long reviewCount = reviews != null ? reviews.size() : 0L;

        if (reviewCount > 0) {
            double avg = reviews.stream().mapToInt(StoreReview::getRating).average().orElse(0.0);
            averageRating = Math.round(avg * 10.0) / 10.0;
        }

        List<StoreProduct> products = storeProductRepository.findByStoreId(store.getId());
        int totalProducts = products != null ? products.size() : 0;
        int inStockCount = 0;
        if (products != null) {
            inStockCount = (int) products.stream()
                    .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() > 0)
                    .count();
        }

        return new StoreRatingDTO(
                store.getId(),
                store.getName(),
                store.getType(),
                store.getOwnerName(),
                store.getAddress(),
                store.getCity(),
                store.getState(),
                store.getPincode(),
                store.getPhone(),
                store.getEmail(),
                store.getDescription(),
                averageRating,
                reviewCount,
                totalProducts,
                inStockCount,
                inStockCount > 0,
                "0.4 km away"
        );
    }

    /**
     * Returns top rated stores meeting the minimum review threshold,
     * ordered by averageRating DESC, reviewCount DESC.
     */
    public List<StoreRatingDTO> getTopRatedStores(int minReviews, Integer limit) {
        List<Store> activeStores = storeRepository.findByIsActiveTrue();

        List<StoreRatingDTO> dtos = activeStores.stream()
                .map(this::buildStoreRatingDTO)
                .filter(dto -> dto.getReviewCount() >= minReviews && dto.getAverageRating() != null)
                .sorted((a, b) -> {
                    int cmp = Double.compare(
                            b.getAverageRating() != null ? b.getAverageRating() : 0.0,
                            a.getAverageRating() != null ? a.getAverageRating() : 0.0
                    );
                    if (cmp != 0) return cmp;
                    return Long.compare(b.getReviewCount(), a.getReviewCount());
                })
                .collect(Collectors.toList());

        if (limit != null && limit > 0 && dtos.size() > limit) {
            return dtos.subList(0, limit);
        }
        return dtos;
    }

    /**
     * Returns all stores with dynamic rating calculations and flexible sorting & filtering.
     */
    public List<StoreRatingDTO> getStoresWithRatings(StoreType type, String sortBy, String query) {
        List<Store> stores;
        if (query != null && !query.trim().isEmpty()) {
            stores = storeRepository.searchByName(query.trim());
        } else if (type != null) {
            stores = storeRepository.findByType(type);
        } else {
            stores = storeRepository.findByIsActiveTrue();
        }

        if (type != null && query != null && !query.trim().isEmpty()) {
            stores = stores.stream()
                    .filter(s -> s.getType() == type)
                    .collect(Collectors.toList());
        }

        List<StoreRatingDTO> dtos = stores.stream()
                .map(this::buildStoreRatingDTO)
                .collect(Collectors.toList());

        String sort = (sortBy != null && !sortBy.trim().isEmpty()) ? sortBy.trim().toLowerCase() : "rating";

        switch (sort) {
            case "reviews":
                dtos.sort((a, b) -> Long.compare(b.getReviewCount(), a.getReviewCount()));
                break;
            case "name":
                dtos.sort(Comparator.comparing(a -> a.getName() != null ? a.getName().toLowerCase() : ""));
                break;
            case "availability":
                dtos.sort((a, b) -> {
                    int cmp = Boolean.compare(b.getHasProducts(), a.getHasProducts());
                    if (cmp != 0) return cmp;
                    return Integer.compare(b.getInStockProducts(), a.getInStockProducts());
                });
                break;
            case "rating":
            default:
                dtos.sort((a, b) -> {
                    // Stores with ratings come before unrated stores
                    if (a.getAverageRating() == null && b.getAverageRating() == null) {
                        return a.getName().compareToIgnoreCase(b.getName());
                    }
                    if (a.getAverageRating() == null) return 1;
                    if (b.getAverageRating() == null) return -1;

                    int cmp = Double.compare(b.getAverageRating(), a.getAverageRating());
                    if (cmp != 0) return cmp;
                    return Long.compare(b.getReviewCount(), a.getReviewCount());
                });
                break;
        }

        return dtos;
    }
}
