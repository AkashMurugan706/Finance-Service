package com.finance.smsfinance.model;

/**
 * Status lifecycle for a finance loan.
 */
public enum LoanStatus {
    PENDING_APPROVAL("Pending Approval"),
    ACTIVE("Active"),
    CLOSED("Closed / Settled"),
    DEFAULTED("Defaulted / Overdue"),
    CANCELLED("Cancelled");

    private final String displayName;

    LoanStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
