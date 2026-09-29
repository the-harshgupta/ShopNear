package com.retail.platform.repository;

import com.retail.platform.model.StoreProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreProductRepository extends JpaRepository<StoreProduct, Long> {

    List<StoreProduct> findByStoreId(Long storeId);

    Optional<StoreProduct> findByStoreIdAndProductId(Long storeId, Long productId);

    @Query("SELECT sp FROM StoreProduct sp WHERE sp.store.id = :storeId AND " +
           "(LOWER(sp.product.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(sp.product.brand) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<StoreProduct> searchByStoreIdAndProductName(Long storeId, String query);

    @Query("SELECT sp FROM StoreProduct sp WHERE sp.store.id = :storeId AND sp.stockQuantity <= sp.lowStockThreshold AND sp.stockQuantity > 0")
    List<StoreProduct> findLowStockByStoreId(Long storeId);

    @Query("SELECT sp FROM StoreProduct sp WHERE sp.store.id = :storeId AND sp.stockQuantity = 0")
    List<StoreProduct> findOutOfStockByStoreId(Long storeId);

    @Query("SELECT sp FROM StoreProduct sp WHERE sp.store.id = :storeId AND sp.product.category.id = :categoryId")
    List<StoreProduct> findByStoreIdAndCategoryId(Long storeId, Long categoryId);

    @Query("SELECT sp FROM StoreProduct sp WHERE sp.store.isActive = true AND (" +
           "LOWER(sp.product.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(sp.product.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(sp.store.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<StoreProduct> searchAcrossStores(String query);

    long countByStoreId(Long storeId);
}
