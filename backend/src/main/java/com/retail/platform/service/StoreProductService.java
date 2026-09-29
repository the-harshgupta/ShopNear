package com.retail.platform.service;

import com.retail.platform.model.Product;
import com.retail.platform.model.Store;
import com.retail.platform.model.StoreProduct;
import com.retail.platform.repository.ProductRepository;
import com.retail.platform.repository.StoreProductRepository;
import com.retail.platform.repository.StoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class StoreProductService {

    private final StoreProductRepository storeProductRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;

    public StoreProductService(StoreProductRepository storeProductRepository,
                                StoreRepository storeRepository,
                                ProductRepository productRepository) {
        this.storeProductRepository = storeProductRepository;
        this.storeRepository = storeRepository;
        this.productRepository = productRepository;
    }

    public List<StoreProduct> getProductsByStore(Long storeId) {
        return storeProductRepository.findByStoreId(storeId);
    }

    public Optional<StoreProduct> getById(Long id) {
        return storeProductRepository.findById(id);
    }

    public List<StoreProduct> searchProducts(Long storeId, String query) {
        return storeProductRepository.searchByStoreIdAndProductName(storeId, query);
    }

    public List<StoreProduct> getLowStockProducts(Long storeId) {
        return storeProductRepository.findLowStockByStoreId(storeId);
    }

    public List<StoreProduct> getOutOfStockProducts(Long storeId) {
        return storeProductRepository.findOutOfStockByStoreId(storeId);
    }

    public List<StoreProduct> getProductsByCategory(Long storeId, Long categoryId) {
        return storeProductRepository.findByStoreIdAndCategoryId(storeId, categoryId);
    }

    /**
     * Add a product to a store with store-specific pricing, stock, and location.
     * If the global product doesn't exist yet, creates it first.
     */
    @Transactional
    public StoreProduct addProductToStore(Long storeId, StoreProduct storeProduct, Long productId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found: " + storeId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        storeProduct.setStore(store);
        storeProduct.setProduct(product);

        return storeProductRepository.save(storeProduct);
    }

    /**
     * Add a product to a store, creating the global product on-the-fly if needed.
     * This is the primary flow for shopkeepers adding items to their store.
     */
    @Transactional
    public StoreProduct addProductToStore(Long storeId, StoreProduct storeProduct, Product newProduct) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found: " + storeId));

        // Save or find the global product
        Product product = productRepository.save(newProduct);

        storeProduct.setStore(store);
        storeProduct.setProduct(product);

        return storeProductRepository.save(storeProduct);
    }

    @Transactional
    public StoreProduct updateStoreProduct(Long id, StoreProduct updates) {
        return storeProductRepository.findById(id).map(sp -> {
            if (updates.getPrice() != null) sp.setPrice(updates.getPrice());
            if (updates.getMrp() != null) sp.setMrp(updates.getMrp());
            if (updates.getPackageQuantity() != null) sp.setPackageQuantity(updates.getPackageQuantity());
            if (updates.getUnit() != null) sp.setUnit(updates.getUnit());
            if (updates.getStockQuantity() != null) sp.setStockQuantity(updates.getStockQuantity());
            if (updates.getLowStockThreshold() != null) sp.setLowStockThreshold(updates.getLowStockThreshold());
            if (updates.getAisleNumber() != null) sp.setAisleNumber(updates.getAisleNumber());
            if (updates.getRowNumber() != null) sp.setRowNumber(updates.getRowNumber());
            if (updates.getSectionLabel() != null) sp.setSectionLabel(updates.getSectionLabel());
            if (updates.getShelfNumber() != null) sp.setShelfNumber(updates.getShelfNumber());
            return storeProductRepository.save(sp); // triggers @PreUpdate → recalculates unitPrice
        }).orElseThrow(() -> new RuntimeException("StoreProduct not found: " + id));
    }

    /**
     * Adjust stock by delta (positive = add, negative = subtract).
     */
    @Transactional
    public StoreProduct adjustStock(Long id, int delta) {
        return storeProductRepository.findById(id).map(sp -> {
            int newStock = sp.getStockQuantity() + delta;
            sp.setStockQuantity(Math.max(0, newStock));
            return storeProductRepository.save(sp);
        }).orElseThrow(() -> new RuntimeException("StoreProduct not found: " + id));
    }

    @Transactional
    public void removeProductFromStore(Long id) {
        storeProductRepository.deleteById(id);
    }

    public long countByStore(Long storeId) {
        return storeProductRepository.countByStoreId(storeId);
    }
}
