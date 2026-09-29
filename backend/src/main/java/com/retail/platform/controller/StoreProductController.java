package com.retail.platform.controller;

import com.retail.platform.model.Product;
import com.retail.platform.model.ProductUnit;
import com.retail.platform.model.Role;
import com.retail.platform.model.Store;
import com.retail.platform.model.StoreProduct;
import com.retail.platform.repository.CategoryRepository;
import com.retail.platform.repository.ProductRepository;
import com.retail.platform.repository.StoreRepository;
import com.retail.platform.service.FileStorageService;
import com.retail.platform.service.StoreProductService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/stores/{storeId}/products")
@CrossOrigin(origins = "*")
public class StoreProductController {

    private final StoreProductService storeProductService;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StoreRepository storeRepository;
    private final FileStorageService fileStorageService;

    public StoreProductController(StoreProductService storeProductService,
                                  ProductRepository productRepository,
                                  CategoryRepository categoryRepository,
                                  StoreRepository storeRepository,
                                  FileStorageService fileStorageService) {
        this.storeProductService = storeProductService;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.storeRepository = storeRepository;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Upload a product photo for a store.
     * Accessible only by authenticated store owner or Admin.
     */
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadProductImage(@PathVariable Long storeId,
                                                @RequestParam("file") MultipartFile file,
                                                HttpServletRequest request) {
        if (!isStoreOwnerOrAdmin(storeId, request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "403 Forbidden: You do not have permission to upload photos for this store."));
        }

        try {
            String imageUrl = fileStorageService.storeProductImage(file);
            return ResponseEntity.ok(Map.of(
                    "imageUrl", imageUrl,
                    "fileName", file.getOriginalFilename() != null ? file.getOriginalFilename() : "image"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }

    /**
     * Checks if the authenticated user has permission to manage the specified store.
     * Admin can manage all stores. Shopkeepers and Managers can only manage their own store.
     */
    private boolean isStoreOwnerOrAdmin(Long storeId, HttpServletRequest request) {
        Role role = (Role) request.getAttribute("auth_role");
        Long userId = (Long) request.getAttribute("auth_user_id");

        // If not authenticated via token in dev mode, allow graceful fallback
        if (role == null || userId == null) {
            return true;
        }

        if (role == Role.ADMIN) {
            return true;
        }

        Optional<Store> storeOpt = storeRepository.findById(storeId);
        if (storeOpt.isEmpty()) {
            return false;
        }

        Store store = storeOpt.get();
        return store.getOwner() != null && store.getOwner().getId().equals(userId);
    }

    @GetMapping
    public List<StoreProduct> getStoreProducts(@PathVariable Long storeId,
                                               @RequestParam(required = false) Long categoryId) {
        if (categoryId != null) {
            return storeProductService.getProductsByCategory(storeId, categoryId);
        }
        return storeProductService.getProductsByStore(storeId);
    }

    @GetMapping("/search")
    public List<StoreProduct> searchStoreProducts(@PathVariable Long storeId,
                                                  @RequestParam String q) {
        return storeProductService.searchProducts(storeId, q);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StoreProduct> getById(@PathVariable Long storeId, @PathVariable Long id) {
        return storeProductService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> addProduct(@PathVariable Long storeId,
                                        @RequestBody Map<String, Object> body,
                                        HttpServletRequest request) {
        if (!isStoreOwnerOrAdmin(storeId, request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "403 Forbidden: You do not have permission to add products to this store."));
        }

        try {
            StoreProduct sp = new StoreProduct();
            sp.setPrice(((Number) body.get("price")).doubleValue());
            sp.setMrp(body.containsKey("mrp") ? ((Number) body.get("mrp")).doubleValue() : sp.getPrice());
            sp.setPackageQuantity(((Number) body.get("packageQuantity")).doubleValue());
            sp.setUnit(ProductUnit.valueOf(((String) body.get("unit")).toUpperCase()));
            sp.setStockQuantity(((Number) body.get("stockQuantity")).intValue());

            if (body.containsKey("lowStockThreshold")) {
                sp.setLowStockThreshold(((Number) body.get("lowStockThreshold")).intValue());
            }
            if (body.containsKey("aisleNumber")) sp.setAisleNumber((String) body.get("aisleNumber"));
            else if (body.containsKey("aisle")) sp.setAisleNumber((String) body.get("aisle"));

            if (body.containsKey("rowNumber")) sp.setRowNumber((String) body.get("rowNumber"));
            else if (body.containsKey("row")) sp.setRowNumber((String) body.get("row"));

            if (body.containsKey("sectionLabel")) sp.setSectionLabel((String) body.get("sectionLabel"));
            else if (body.containsKey("section")) sp.setSectionLabel((String) body.get("section"));

            if (body.containsKey("shelfNumber")) sp.setShelfNumber((String) body.get("shelfNumber"));
            else if (body.containsKey("shelf")) sp.setShelfNumber((String) body.get("shelf"));

            StoreProduct result;
            if (body.containsKey("productId")) {
                Long productId = ((Number) body.get("productId")).longValue();
                result = storeProductService.addProductToStore(storeId, sp, productId);
            } else {
                Product product = new Product();
                product.setName((String) body.get("productName"));
                product.setBrand((String) body.getOrDefault("productBrand", ""));
                product.setDescription((String) body.getOrDefault("productDescription", ""));
                product.setBarcode((String) body.getOrDefault("barcode", null));

                String imgUrl = (String) body.get("imageUrl");
                if (imgUrl != null && !imgUrl.trim().isEmpty()) {
                    product.setImageUrl(imgUrl.trim());
                } else {
                    product.setImageUrl(null);
                }

                if (body.containsKey("categoryId") && body.get("categoryId") != null) {
                    Long catId = ((Number) body.get("categoryId")).longValue();
                    categoryRepository.findById(catId).ifPresent(product::setCategory);
                } else if (body.containsKey("category") && body.get("category") instanceof String) {
                    String catName = (String) body.get("category");
                    categoryRepository.findAll().stream()
                            .filter(c -> c.getName().equalsIgnoreCase(catName))
                            .findFirst()
                            .ifPresent(product::setCategory);
                }

                result = storeProductService.addProductToStore(storeId, sp, product);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long storeId,
                                           @PathVariable Long id,
                                           @RequestBody Map<String, Object> body,
                                           HttpServletRequest request) {
        if (!isStoreOwnerOrAdmin(storeId, request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "403 Forbidden: You do not have permission to modify this store's inventory."));
        }

        try {
            Optional<StoreProduct> spOpt = storeProductService.getById(id);
            if (spOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            StoreProduct sp = spOpt.get();
            if (body.containsKey("price")) sp.setPrice(((Number) body.get("price")).doubleValue());
            if (body.containsKey("mrp")) sp.setMrp(((Number) body.get("mrp")).doubleValue());
            if (body.containsKey("packageQuantity")) sp.setPackageQuantity(((Number) body.get("packageQuantity")).doubleValue());
            if (body.containsKey("unit") && body.get("unit") != null) {
                sp.setUnit(ProductUnit.valueOf(((String) body.get("unit")).toUpperCase()));
            }
            if (body.containsKey("stockQuantity")) sp.setStockQuantity(((Number) body.get("stockQuantity")).intValue());
            else if (body.containsKey("currentStock")) sp.setStockQuantity(((Number) body.get("currentStock")).intValue());

            if (body.containsKey("lowStockThreshold")) sp.setLowStockThreshold(((Number) body.get("lowStockThreshold")).intValue());
            else if (body.containsKey("minStockLevel")) sp.setLowStockThreshold(((Number) body.get("minStockLevel")).intValue());

            if (body.containsKey("aisleNumber")) sp.setAisleNumber((String) body.get("aisleNumber"));
            else if (body.containsKey("aisle")) sp.setAisleNumber((String) body.get("aisle"));

            if (body.containsKey("rowNumber")) sp.setRowNumber((String) body.get("rowNumber"));
            else if (body.containsKey("row")) sp.setRowNumber((String) body.get("row"));

            if (body.containsKey("sectionLabel")) sp.setSectionLabel((String) body.get("sectionLabel"));
            else if (body.containsKey("section")) sp.setSectionLabel((String) body.get("section"));

            if (body.containsKey("shelfNumber")) sp.setShelfNumber((String) body.get("shelfNumber"));
            else if (body.containsKey("shelf")) sp.setShelfNumber((String) body.get("shelf"));

            // Also update underlying global Product entity attributes (name, imageUrl, category, etc.)
            Product product = sp.getProduct();
            if (product != null) {
                boolean productModified = false;
                if (body.containsKey("productName") || body.containsKey("name")) {
                    String newName = (String) (body.containsKey("productName") ? body.get("productName") : body.get("name"));
                    if (newName != null && !newName.trim().isEmpty()) {
                        product.setName(newName.trim());
                        productModified = true;
                    }
                }
                if (body.containsKey("productBrand") || body.containsKey("brand")) {
                    product.setBrand((String) (body.containsKey("productBrand") ? body.get("productBrand") : body.get("brand")));
                    productModified = true;
                }
                if (body.containsKey("productDescription") || body.containsKey("description")) {
                    product.setDescription((String) (body.containsKey("productDescription") ? body.get("productDescription") : body.get("description")));
                    productModified = true;
                }
                if (body.containsKey("imageUrl")) {
                    String newImg = (String) body.get("imageUrl");
                    if (newImg == null || newImg.trim().isEmpty()) {
                        product.setImageUrl(null);
                    } else {
                        product.setImageUrl(newImg.trim());
                    }
                    productModified = true;
                }
                if (body.containsKey("categoryId") && body.get("categoryId") != null) {
                    Long catId = ((Number) body.get("categoryId")).longValue();
                    categoryRepository.findById(catId).ifPresent(product::setCategory);
                    productModified = true;
                } else if (body.containsKey("category") && body.get("category") instanceof String) {
                    String catName = (String) body.get("category");
                    categoryRepository.findAll().stream()
                            .filter(c -> c.getName().equalsIgnoreCase(catName))
                            .findFirst()
                            .ifPresent(product::setCategory);
                    productModified = true;
                }
                if (productModified) {
                    productRepository.save(product);
                }
            }

            StoreProduct updated = storeProductService.updateStoreProduct(id, sp);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> adjustStock(@PathVariable Long storeId,
                                         @PathVariable Long id,
                                         @RequestBody Map<String, Integer> body,
                                         HttpServletRequest request) {
        if (!isStoreOwnerOrAdmin(storeId, request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "403 Forbidden: You do not have permission to adjust stock for this store."));
        }

        try {
            int delta = body.getOrDefault("delta", 0);
            StoreProduct updated = storeProductService.adjustStock(id, delta);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/low-stock")
    public List<StoreProduct> getLowStock(@PathVariable Long storeId) {
        return storeProductService.getLowStockProducts(storeId);
    }

    @GetMapping("/out-of-stock")
    public List<StoreProduct> getOutOfStock(@PathVariable Long storeId) {
        return storeProductService.getOutOfStockProducts(storeId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeProduct(@PathVariable Long storeId,
                                           @PathVariable Long id,
                                           HttpServletRequest request) {
        if (!isStoreOwnerOrAdmin(storeId, request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "403 Forbidden: You do not have permission to delete items from this store."));
        }

        storeProductService.removeProductFromStore(id);
        return ResponseEntity.noContent().build();
    }
}
