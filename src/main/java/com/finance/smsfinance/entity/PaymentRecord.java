package com.finance.smsfinance.entity;

import com.finance.smsfinance.model.PaymentType;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_records", indexes = {
    @Index(name = "idx_payment_receipt", columnList = "receipt_number", unique = true),
    @Index(name = "idx_payment_loan", columnList = "loan_id"),
    @Index(name = "idx_payment_customer", columnList = "customer_id"),
    @Index(name = "idx_payment_date", columnList = "payment_date")
})
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_number", nullable = false, unique = true, length = 40)
    private String receiptNumber;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @NotNull(message = "Payment date is required")
    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @NotNull(message = "Amount paid is required")
    @DecimalMin(value = "1.00", message = "Amount paid must be at least 1.00")
    @Column(name = "amount_paid", nullable = false, precision = 15, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "interest_portion", nullable = false, precision = 15, scale = 2)
    private BigDecimal interestPortion = BigDecimal.ZERO;

    @Column(name = "principal_portion", nullable = false, precision = 15, scale = 2)
    private BigDecimal principalPortion = BigDecimal.ZERO;

    @Column(name = "penalty_portion", nullable = false, precision = 15, scale = 2)
    private BigDecimal penaltyPortion = BigDecimal.ZERO;

    @Column(name = "principal_balance_after", precision = 15, scale = 2)
    private BigDecimal principalBalanceAfter;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false, length = 30)
    private PaymentType paymentType = PaymentType.CASH;

    @Column(name = "transaction_reference", length = 100)
    private String transactionReference;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "recorded_by", length = 100)
    private String recordedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public PaymentRecord() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.interestPortion == null) {
            this.interestPortion = BigDecimal.ZERO;
        }
        if (this.principalPortion == null) {
            this.principalPortion = BigDecimal.ZERO;
        }
        if (this.penaltyPortion == null) {
            this.penaltyPortion = BigDecimal.ZERO;
        }
        if (this.paymentType == null) {
            this.paymentType = PaymentType.CASH;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public Loan getLoan() {
        return loan;
    }

    public void setLoan(Loan loan) {
        this.loan = loan;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
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

    public BigDecimal getPrincipalBalanceAfter() {
        return principalBalanceAfter;
    }

    public void setPrincipalBalanceAfter(BigDecimal principalBalanceAfter) {
        this.principalBalanceAfter = principalBalanceAfter;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
