package com.retail.platform.model;

/**
 * Model representing a verified product image result retrieved from the real internet.
 * Tracks source origin, domain, direct image URL, thumbnail, and relevance score.
 */
public class ProductImageResult {

    private String imageUrl;
    private String thumbnailUrl;
    private String title;
    private String sourceUrl;
    private String sourceName;
    private int relevanceScore;

    public ProductImageResult() {
    }

    public ProductImageResult(String imageUrl, String thumbnailUrl, String title, String sourceUrl, String sourceName, int relevanceScore) {
        this.imageUrl = imageUrl;
        this.thumbnailUrl = thumbnailUrl != null ? thumbnailUrl : imageUrl;
        this.title = title;
        this.sourceUrl = sourceUrl;
        this.sourceName = sourceName;
        this.relevanceScore = relevanceScore;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl != null ? thumbnailUrl : imageUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public int getRelevanceScore() {
        return relevanceScore;
    }

    public void setRelevanceScore(int relevanceScore) {
        this.relevanceScore = relevanceScore;
    }

    @Override
    public String toString() {
        return "ProductImageResult{" +
                "title='" + title + '\'' +
                ", sourceName='" + sourceName + '\'' +
                ", relevanceScore=" + relevanceScore +
                ", imageUrl='" + imageUrl + '\'' +
                '}';
    }
}
