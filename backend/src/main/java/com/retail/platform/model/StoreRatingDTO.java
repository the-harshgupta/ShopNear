package com.retail.platform.model;

public class StoreRatingDTO {
    private Long id;
    private String name;
    private StoreType type;
    private String ownerName;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String phone;
    private String email;
    private String description;
    private Double averageRating; // null if 0 reviews
    private Long reviewCount;
    private Integer totalProducts;
    private Integer inStockProducts;
    private Boolean hasProducts;
    private String distance;

    public StoreRatingDTO() {}

    public StoreRatingDTO(
            Long id,
            String name,
            StoreType type,
            String ownerName,
            String address,
            String city,
            String state,
            String pincode,
            String phone,
            String email,
            String description,
            Double averageRating,
            Long reviewCount,
            Integer totalProducts,
            Integer inStockProducts,
            Boolean hasProducts,
            String distance) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.ownerName = ownerName;
        this.address = address;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.phone = phone;
        this.email = email;
        this.description = description;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount != null ? reviewCount : 0L;
        this.totalProducts = totalProducts != null ? totalProducts : 0;
        this.inStockProducts = inStockProducts != null ? inStockProducts : 0;
        this.hasProducts = hasProducts != null ? hasProducts : false;
        this.distance = distance != null ? distance : "0.4 km away";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public StoreType getType() { return type; }
    public void setType(StoreType type) { this.type = type; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Long getReviewCount() { return reviewCount; }
    public void setReviewCount(Long reviewCount) { this.reviewCount = reviewCount; }

    public Integer getTotalProducts() { return totalProducts; }
    public void setTotalProducts(Integer totalProducts) { this.totalProducts = totalProducts; }

    public Integer getInStockProducts() { return inStockProducts; }
    public void setInStockProducts(Integer inStockProducts) { this.inStockProducts = inStockProducts; }

    public Boolean getHasProducts() { return hasProducts; }
    public void setHasProducts(Boolean hasProducts) { this.hasProducts = hasProducts; }

    public String getDistance() { return distance; }
    public void setDistance(String distance) { this.distance = distance; }
}
