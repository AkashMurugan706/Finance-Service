package com.finance.smsfinance.model;

/**
 * Payment method types accepted by SMS Finance Service.
 */
public enum PaymentType {
    CASH("Cash"),
    UPI("UPI Transfer"),
    BANK_TRANSFER("NEFT / RTGS / IMPS"),
    CHEQUE("Cheque");

    private final String label;

    PaymentType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
