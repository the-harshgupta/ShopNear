package com.retail.platform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "demand_logs")
public class DemandLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String searchKeyword;

    private Long productId;

    private String productName;

    private String eventType; // SEARCH_UNAVAILABLE, LIST_ADDED, VIEWED

    private Integer missedSearchesCount;

    private Integer shoppingListAddsCount;

    private Double estimatedMissedRevenue;

    private String insight;

    private String recommendedAction;

    private LocalDateTime timestamp;

    public DemandLog() {
        this.timestamp = LocalDateTime.now();
    }

    public DemandLog(String productName, Long productId, String eventType, Integer missedSearches, Integer listAdds, Double missedRevenue, String insight, String action) {
        this.productName = productName;
        this.productId = productId;
        this.eventType = eventType;
        this.missedSearchesCount = missedSearches;
        this.shoppingListAddsCount = listAdds;
        this.estimatedMissedRevenue = missedRevenue;
        this.insight = insight;
        this.recommendedAction = action;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSearchKeyword() { return searchKeyword; }
    public void setSearchKeyword(String searchKeyword) { this.searchKeyword = searchKeyword; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public Integer getMissedSearchesCount() { return missedSearchesCount; }
    public void setMissedSearchesCount(Integer missedSearchesCount) { this.missedSearchesCount = missedSearchesCount; }

    public Integer getShoppingListAddsCount() { return shoppingListAddsCount; }
    public void setShoppingListAddsCount(Integer shoppingListAddsCount) { this.shoppingListAddsCount = shoppingListAddsCount; }

    public Double getEstimatedMissedRevenue() { return estimatedMissedRevenue; }
    public void setEstimatedMissedRevenue(Double estimatedMissedRevenue) { this.estimatedMissedRevenue = estimatedMissedRevenue; }

    public String getInsight() { return insight; }
    public void setInsight(String insight) { this.insight = insight; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
