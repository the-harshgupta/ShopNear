package com.retail.platform.model;

import jakarta.persistence.*;

@Entity
@Table(name = "shopping_list_items")
public class ShoppingListItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(nullable = false)
    private String name;

    private Long matchedProductId;

    private Integer quantity;

    private Boolean isPurchased;

    public ShoppingListItem() {
        this.quantity = 1;
        this.isPurchased = false;
    }

    public ShoppingListItem(Long userId, String name, Long matchedProductId, Integer quantity) {
        this.userId = userId;
        this.name = name;
        this.matchedProductId = matchedProductId;
        this.quantity = quantity != null ? quantity : 1;
        this.isPurchased = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getMatchedProductId() { return matchedProductId; }
    public void setMatchedProductId(Long matchedProductId) { this.matchedProductId = matchedProductId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Boolean getIsPurchased() { return isPurchased; }
    public void setIsPurchased(Boolean isPurchased) { this.isPurchased = isPurchased; }
}
