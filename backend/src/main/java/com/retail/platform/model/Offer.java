package com.retail.platform.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "offers")
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "storeProducts", "sales", "offers", "owner"})
    private Store store;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "store_product_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"store", "hibernateLazyInitializer", "handler"})
    private StoreProduct storeProduct;

    private String title;

    private Double dealPrice;

    private Integer discountPercent;

    private LocalDate startDate;

    private LocalDate endDate;

    private Boolean isActive;

    public Offer() {
        this.isActive = true;
        this.startDate = LocalDate.now();
    }

    public Offer(Store store, StoreProduct storeProduct, String title, Double dealPrice, Integer discountPercent) {
        this();
        this.store = store;
        this.storeProduct = storeProduct;
        this.title = title;
        this.dealPrice = dealPrice;
        this.discountPercent = discountPercent;
    }

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Store getStore() { return store; }
    public void setStore(Store store) { this.store = store; }

    public StoreProduct getStoreProduct() { return storeProduct; }
    public void setStoreProduct(StoreProduct storeProduct) { this.storeProduct = storeProduct; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Double getDealPrice() { return dealPrice; }
    public void setDealPrice(Double dealPrice) { this.dealPrice = dealPrice; }

    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
