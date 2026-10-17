package com.finance.smsfinance.model;

/**
 * Status lifecycle for collateral documents or pledged assets.
 */
public enum CollateralStatus {
    PENDING_VERIFICATION("Pending Verification"),
    VERIFIED("Verified"),
    PLEDGED("Pledged & Retained in Vault"),
    RETURNED("Returned to Customer"),
    LIQUIDATED("Liquidated / Confiscated");

    private final String displayName;

    CollateralStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
