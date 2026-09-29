package com.retail.platform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_audit_logs")
public class AiAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long storeId;

    @Column(nullable = false)
    private Long userId;

    private String userName;

    @Column(nullable = false)
    private String action; // ADD_STOCK, REDUCE_STOCK, UPDATE_PRICE, UPDATE_PRODUCT, UPDATE_LOCATION, CREATE_PRODUCT, DELETE_PRODUCT, RECORD_SALE

    @Column(length = 1000)
    private String command;

    @Column(length = 1000)
    private String details;

    @Column(nullable = false)
    private String result; // SUCCESS, FAILED

    private LocalDateTime timestamp;

    public AiAuditLog() {
        this.timestamp = LocalDateTime.now();
    }

    public AiAuditLog(Long storeId, Long userId, String userName, String action, String command, String details, String result) {
        this.storeId = storeId;
        this.userId = userId;
        this.userName = userName;
        this.action = action;
        this.command = command;
        this.details = details;
        this.result = result;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getCommand() { return command; }
    public void setCommand(String command) { this.command = command; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
