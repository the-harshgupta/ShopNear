package com.retail.platform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "operational_issues")
public class OperationalIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String location;

    private String severity; // LOW, MEDIUM, HIGH

    private String status; // OPEN, IN_PROGRESS, RESOLVED

    private String reportedBy;

    private String reportedAt;

    @Column(length = 1000)
    private String details;

    private LocalDateTime createdAt;

    public OperationalIssue() {
        this.createdAt = LocalDateTime.now();
        this.status = "OPEN";
    }

    public OperationalIssue(String title, String location, String severity, String status, String reportedBy, String reportedAt, String details) {
        this.title = title;
        this.location = location;
        this.severity = severity;
        this.status = status;
        this.reportedBy = reportedBy;
        this.reportedAt = reportedAt;
        this.details = details;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }

    public String getReportedAt() { return reportedAt; }
    public void setReportedAt(String reportedAt) { this.reportedAt = reportedAt; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
