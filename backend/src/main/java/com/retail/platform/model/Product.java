package com.retail.platform.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    private String brand;

    @Column(length = 500)
    private String description;

    @Column(unique = true)
    private String barcode;

    @Column(length = 1000)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    public Product() {}

    public Product(String name, String brand, String description, String barcode, String imageUrl) {
        this.name = name;
        this.brand = brand;
        this.description = description;
        this.barcode = barcode;
        this.imageUrl = imageUrl;
    }

    public Product(String name, String brand, String description, String barcode, String imageUrl, Category category) {
        this.name = name;
        this.brand = brand;
        this.description = description;
        this.barcode = barcode;
        this.imageUrl = imageUrl;
        this.category = category;
    }

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    @Column(length = 1000)
    private String imageSourceUrl;

    private String imageSourceName;

    public String getImageSourceUrl() { return imageSourceUrl; }
    public void setImageSourceUrl(String imageSourceUrl) { this.imageSourceUrl = imageSourceUrl; }

    public String getImageSourceName() { return imageSourceName; }
    public void setImageSourceName(String imageSourceName) { this.imageSourceName = imageSourceName; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
}
