package com.retail.platform.model;

import jakarta.persistence.*;

@Entity
@Table(name = "sale_items")
public class SaleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "store_product_id")
    private StoreProduct storeProduct;

    private String productName;

    private Integer quantity;

    private Double unitPrice;

    private Double totalPrice;

    @Enumerated(EnumType.STRING)
    private ProductUnit unit;

    public SaleItem() {}

    public SaleItem(StoreProduct storeProduct, Integer quantity) {
        this.storeProduct = storeProduct;
        this.productName = storeProduct.getProduct().getName();
        this.quantity = quantity;
        this.unitPrice = storeProduct.getPrice();
        this.unit = storeProduct.getUnit();
        this.totalPrice = this.unitPrice * this.quantity;
    }

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Sale getSale() { return sale; }
    public void setSale(Sale sale) { this.sale = sale; }

    public StoreProduct getStoreProduct() { return storeProduct; }
    public void setStoreProduct(StoreProduct storeProduct) { this.storeProduct = storeProduct; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public ProductUnit getUnit() { return unit; }
    public void setUnit(ProductUnit unit) { this.unit = unit; }
}
