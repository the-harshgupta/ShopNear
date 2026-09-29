package com.retail.platform.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "store_products")
public class StoreProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "storeProducts", "sales", "offers", "owner"})
    private Store store;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Double price;

    private Double mrp;

    /** Package size — e.g. 500 for "500g", 1 for "1 kg", 200 for "200 ml" */
    @NotNull
    @Positive
    @Column(nullable = false)
    private Double packageQuantity;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductUnit unit;

    /**
     * Auto-calculated normalized unit price.
     * GRAM → (price / packageQuantity) × 1000 = ₹/kg
     * ML   → (price / packageQuantity) × 1000 = ₹/litre
     * KG   → price / packageQuantity = ₹/kg
     * LITRE→ price / packageQuantity = ₹/litre
     * Others → price / packageQuantity = ₹/unit
     */
    private Double unitPrice;

    @NotNull
    @Column(nullable = false)
    private Integer stockQuantity;

    private Integer lowStockThreshold;

    // --- Physical Location fields ---
    private String aisleNumber;
    private String rowNumber;
    private String sectionLabel;
    private String shelfNumber;

    private Boolean isAvailable;

    public StoreProduct() {
        this.stockQuantity = 0;
        this.lowStockThreshold = 5;
        this.isAvailable = true;
    }

    @PrePersist
    @PreUpdate
    protected void calculateUnitPrice() {
        if (price != null && packageQuantity != null && packageQuantity > 0) {
            switch (unit) {
                case GRAM:
                    // Convert to ₹/kg: (price / grams) × 1000
                    this.unitPrice = (price / packageQuantity) * 1000.0;
                    break;
                case ML:
                    // Convert to ₹/litre: (price / ml) × 1000
                    this.unitPrice = (price / packageQuantity) * 1000.0;
                    break;
                case KG:
                case LITRE:
                    // Already in base unit
                    this.unitPrice = price / packageQuantity;
                    break;
                default:
                    // PIECE, PACKET, BOX, OTHER — price per unit
                    this.unitPrice = price / packageQuantity;
                    break;
            }
            // Round to 2 decimal places
            this.unitPrice = Math.round(this.unitPrice * 100.0) / 100.0;
        }

        // Derive availability from stock
        this.isAvailable = this.stockQuantity != null && this.stockQuantity > 0;
    }

    /**
     * Returns the display string for the normalized unit price.
     * e.g. "₹28.00/kg", "₹150.00/litre", "₹5.00/piece"
     */
    public String getUnitPriceDisplay() {
        if (unitPrice == null) return "";
        return switch (unit) {
            case GRAM, KG -> String.format("\u20B9%.2f/kg", unitPrice);
            case ML, LITRE -> String.format("\u20B9%.2f/litre", unitPrice);
            case PIECE -> String.format("\u20B9%.2f/piece", unitPrice);
            case PACKET -> String.format("\u20B9%.2f/packet", unitPrice);
            case BOX -> String.format("\u20B9%.2f/box", unitPrice);
            default -> String.format("\u20B9%.2f/unit", unitPrice);
        };
    }

    public boolean isLowStock() {
        return stockQuantity != null && lowStockThreshold != null
                && stockQuantity > 0 && stockQuantity <= lowStockThreshold;
    }

    public boolean isOutOfStock() {
        return stockQuantity == null || stockQuantity <= 0;
    }

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Store getStore() { return store; }
    public void setStore(Store store) { this.store = store; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Double getMrp() { return mrp; }
    public void setMrp(Double mrp) { this.mrp = mrp; }

    public Double getPackageQuantity() { return packageQuantity; }
    public void setPackageQuantity(Double packageQuantity) { this.packageQuantity = packageQuantity; }

    public ProductUnit getUnit() { return unit; }
    public void setUnit(ProductUnit unit) { this.unit = unit; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Integer getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(Integer lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }

    public String getAisleNumber() { return aisleNumber; }
    public void setAisleNumber(String aisleNumber) { this.aisleNumber = aisleNumber; }

    public String getRowNumber() { return rowNumber; }
    public void setRowNumber(String rowNumber) { this.rowNumber = rowNumber; }

    public String getSectionLabel() { return sectionLabel; }
    public void setSectionLabel(String sectionLabel) { this.sectionLabel = sectionLabel; }

    public String getShelfNumber() { return shelfNumber; }
    public void setShelfNumber(String shelfNumber) { this.shelfNumber = shelfNumber; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
}
