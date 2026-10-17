package com.finance.smsfinance.model;

/**
 * Interest calculation models supported by SMS Finance Service.
 * Particularly popular in community finance is VATTI_PER_HUNDRED (e.g. ₹2 or ₹3 per ₹100 per month).
 */
public enum InterestType {
    VATTI_PER_HUNDRED("Vatti (Rupees per ₹100 / Month)"),
    SIMPLE_MONTHLY("Simple Monthly Percentage"),
    COMPOUND_MONTHLY("Compound Monthly Interest"),
    FLAT_ANNUAL("Flat Annual Percentage");

    private final String description;

    InterestType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
