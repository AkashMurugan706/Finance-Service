package com.finance.smsfinance.dto;

import com.finance.smsfinance.model.PaymentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PaymentRequestDto {

    private String receiptNumber;

    @NotNull(message = "Loan ID is required")
    private Long loanId;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    @NotNull(message = "Amount paid is required")
    @DecimalMin(value = "1.00", message = "Amount paid must be at least ₹1.00")
    private BigDecimal amountPaid;

    /**
     * If true, the system calculates accrued interest up to paymentDate and automatically splits
     * amountPaid into interestPortion and principalPortion.
     */
    private Boolean autoAllocate = true;

    private BigDecimal interestPortion;
    private BigDecimal principalPortion;
    private BigDecimal penaltyPortion;

    private PaymentType paymentType = PaymentType.CASH;
    private String transactionReference;
    private String notes;
    private String recordedBy;

    public PaymentRequestDto() {
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public Long getLoanId() {
        return loanId;
    }

    public void setLoanId(Long loanId) {
        this.loanId = loanId;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public Boolean getAutoAllocate() {
        return autoAllocate;
    }

    public void setAutoAllocate(Boolean autoAllocate) {
        this.autoAllocate = autoAllocate;
    }

    public BigDecimal getInterestPortion() {
        return interestPortion;
    }

    public void setInterestPortion(BigDecimal interestPortion) {
        this.interestPortion = interestPortion;
    }

    public BigDecimal getPrincipalPortion() {
        return principalPortion;
    }

    public void setPrincipalPortion(BigDecimal principalPortion) {
        this.principalPortion = principalPortion;
    }

    public BigDecimal getPenaltyPortion() {
        return penaltyPortion;
    }

    public void setPenaltyPortion(BigDecimal penaltyPortion) {
        this.penaltyPortion = penaltyPortion;
    }

    public PaymentType getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(PaymentType paymentType) {
        this.paymentType = paymentType;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(String recordedBy) {
        this.recordedBy = recordedBy;
    }
}
