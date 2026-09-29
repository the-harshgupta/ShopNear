package com.retail.platform.model;

public enum Role {
    CUSTOMER,
    SHOPKEEPER,
    SUPERMARKET_MANAGER,
    STORE_MANAGER,
    ADMIN;

    public static Role fromString(String value) {
        if (value == null) return CUSTOMER;
        String upper = value.trim().toUpperCase();
        if ("STORE_MANAGER".equals(upper)) return SUPERMARKET_MANAGER;
        try {
            return Role.valueOf(upper);
        } catch (IllegalArgumentException e) {
            return CUSTOMER;
        }
    }
}
