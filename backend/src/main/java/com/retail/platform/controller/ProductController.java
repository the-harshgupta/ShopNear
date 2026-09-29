package com.retail.platform.controller;

import com.retail.platform.model.Category;
import com.retail.platform.model.Product;
import com.retail.platform.model.StoreProduct;
import com.retail.platform.repository.StoreProductRepository;
import com.retail.platform.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Global product catalog controller.
 * For store-specific product operations, use StoreProductController.
 */
@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;
    private final StoreProductRepository storeProductRepository;
    private final com.retail.platform.service.ProductImageCanonicalSyncService canonicalSyncService;

    public ProductController(ProductService productService,
                             StoreProductRepository storeProductRepository,
                             com.retail.platform.service.ProductImageCanonicalSyncService canonicalSyncService) {
        this.productService = productService;
        this.storeProductRepository = storeProductRepository;
        this.canonicalSyncService = canonicalSyncService;
    }

    @PostMapping("/sync-canonical-images")
    public ResponseEntity<?> syncCanonicalImages() {
        Map<String, Object> result = canonicalSyncService.syncAllProducts();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/search-stores")
    public List<Map<String, Object>> searchStoresForProduct(@RequestParam String q) {
        if (q == null || q.trim().isEmpty()) {
            return List.of();
        }
        List<StoreProduct> storeProducts = storeProductRepository.searchAcrossStores(q.trim());
        List<Map<String, Object>> results = new ArrayList<>();

        for (StoreProduct sp : storeProducts) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", sp.getId());
            map.put("storeProductId", sp.getId());
            map.put("productId", sp.getProduct() != null ? sp.getProduct().getId() : null);
            map.put("name", sp.getProduct() != null ? sp.getProduct().getName() : "Unknown");
            map.put("productName", sp.getProduct() != null ? sp.getProduct().getName() : "Unknown");
            map.put("brand", sp.getProduct() != null ? sp.getProduct().getBrand() : "");
            map.put("description", sp.getProduct() != null ? sp.getProduct().getDescription() : "");
            map.put("imageUrl", sp.getProduct() != null ? sp.getProduct().getImageUrl() : "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=60");
            map.put("category", (sp.getProduct() != null && sp.getProduct().getCategory() != null) ? sp.getProduct().getCategory().getName() : "General");
            map.put("price", sp.getPrice());
            map.put("mrp", sp.getMrp() != null ? sp.getMrp() : sp.getPrice());
            map.put("packageQuantity", sp.getPackageQuantity() != null ? sp.getPackageQuantity() : 1.0);
            map.put("unit", sp.getUnit() != null ? sp.getUnit().name() : "PACKET");
            map.put("unitPrice", sp.getUnitPrice());
            map.put("unitPriceDisplay", sp.getUnitPriceDisplay());
            map.put("currentStock", sp.getStockQuantity());
            map.put("stockQuantity", sp.getStockQuantity());
            map.put("isAvailable", sp.getStockQuantity() > 0);
            map.put("aisleNumber", sp.getAisleNumber());
            map.put("aisle", sp.getAisleNumber());
            map.put("rowNumber", sp.getRowNumber());
            map.put("row", sp.getRowNumber());
            map.put("sectionLabel", sp.getSectionLabel());
            map.put("section", sp.getSectionLabel());
            map.put("shelfNumber", sp.getShelfNumber());
            map.put("shelf", sp.getShelfNumber());

            if (sp.getStore() != null) {
                map.put("storeId", sp.getStore().getId());
                map.put("storeName", sp.getStore().getName());
                map.put("storeType", sp.getStore().getType() != null ? sp.getStore().getType().name() : "KIRANA_STORE");
                map.put("storeAddress", sp.getStore().getAddress());
                map.put("storePhone", sp.getStore().getPhone());
                map.put("city", sp.getStore().getCity());
            }

            results.add(map);
        }

        return results;
    }

    @GetMapping
    public List<Product> getAllProducts(@RequestParam(required = false) String search,
                                        @RequestParam(required = false) Long categoryId) {
        if (search != null && !search.isEmpty()) {
            return productService.searchProducts(search);
        }
        if (categoryId != null) {
            return productService.getProductsByCategory(categoryId);
        }
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product,
                                  @RequestParam(required = false) Long categoryId) {
        if (categoryId != null) {
            return productService.createProduct(product, categoryId);
        }
        return productService.createProduct(product);
    }

    @GetMapping("/categories")
    public List<Category> getAllCategories() {
        return productService.getAllCategories();
    }
}
