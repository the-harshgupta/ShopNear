package com.retail.platform.model;

import jakarta.persistence.*;

@Entity
@Table(name = "aisles")
public class Aisle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sectionId;

    private String sectionName;

    @Column(nullable = false)
    private String aisleNumber;

    private String shelfIdentifier;

    private String description;

    public Aisle() {}

    public Aisle(Long sectionId, String sectionName, String aisleNumber, String shelfIdentifier, String description) {
        this.sectionId = sectionId;
        this.sectionName = sectionName;
        this.aisleNumber = aisleNumber;
        this.shelfIdentifier = shelfIdentifier;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSectionId() { return sectionId; }
    public void setSectionId(Long sectionId) { this.sectionId = sectionId; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public String getAisleNumber() { return aisleNumber; }
    public void setAisleNumber(String aisleNumber) { this.aisleNumber = aisleNumber; }

    public String getShelfIdentifier() { return shelfIdentifier; }
    public void setShelfIdentifier(String shelfIdentifier) { this.shelfIdentifier = shelfIdentifier; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
