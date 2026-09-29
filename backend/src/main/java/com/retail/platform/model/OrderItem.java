package com.retail.platform.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonAlias({"storeProductId", "store_product_id"})
    private Long productId;

    private String productName;

    private Integer quantity;

    private Double unitPrice;

    private String aisle;

    public OrderItem() {}

    public OrderItem(Long productId, String productName, Integer quantity, Double unitPrice, String aisle) {
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.aisle = aisle;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getStoreProductId() { return productId; }
    public void setStoreProductId(Long storeProductId) { this.productId = storeProductId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public String getAisle() { return aisle; }
    public void setAisle(String aisle) { this.aisle = aisle; }
}

