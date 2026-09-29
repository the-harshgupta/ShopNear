package com.retail.platform.service;

import com.retail.platform.model.Category;
import com.retail.platform.model.Product;
import com.retail.platform.repository.CategoryRepository;
import com.retail.platform.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for global product catalog management.
 * Products here are catalog items — pricing, stock, and location are in StoreProduct.
 */
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> searchProducts(String query) {
        return productRepository.searchProducts(query);
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    @Transactional
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    @Transactional
    public Product createProduct(Product product, Long categoryId) {
        if (categoryId != null) {
            categoryRepository.findById(categoryId).ifPresent(product::setCategory);
        }
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id).map(product -> {
            if (updatedProduct.getName() != null) product.setName(updatedProduct.getName());
            if (updatedProduct.getBrand() != null) product.setBrand(updatedProduct.getBrand());
            if (updatedProduct.getDescription() != null) product.setDescription(updatedProduct.getDescription());
            if (updatedProduct.getBarcode() != null) product.setBarcode(updatedProduct.getBarcode());
            if (updatedProduct.getImageUrl() != null) product.setImageUrl(updatedProduct.getImageUrl());
            if (updatedProduct.getCategory() != null) product.setCategory(updatedProduct.getCategory());
            return productRepository.save(product);
        }).orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    @Transactional
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}
