package com.finance.smsfinance.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.finance.smsfinance.model.InterestType;
import com.finance.smsfinance.model.LoanStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "loans", indexes = {
    @Index(name = "idx_loan_number", columnList = "loan_number", unique = true),
    @Index(name = "idx_loan_status", columnList = "loan_status"),
    @Index(name = "idx_loan_customer", columnList = "customer_id")
})
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "loan_number", nullable = false, unique = true, length = 32)
    private String loanNumber;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @NotNull(message = "Principal amount is required")
    @DecimalMin(value = "100.00", message = "Principal amount must be at least 100")
    @Column(name = "principal_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal principalAmount;

    /**
     * If interestType == VATTI_PER_HUNDRED: Rate per ₹100 per month (e.g., 2.00 = ₹2 per 100).
     * If interestType == SIMPLE_MONTHLY or COMPOUND_MONTHLY: Monthly percentage (e.g., 2.00%).
     * If FLAT_ANNUAL: Annual percentage (e.g., 24.00%).
     */
    @NotNull(message = "Interest rate is required")
    @DecimalMin(value = "0.01", message = "Interest rate must be greater than 0")
    @Column(name = "interest_rate", nullable = false, precision = 8, scale = 2)
    private BigDecimal interestRate;

    @Enumerated(EnumType.STRING)
    @Column(name = "interest_type", nullable = false, length = 30)
    private InterestType interestType = InterestType.VATTI_PER_HUNDRED;

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "tenure_months")
    private Integer tenureMonths;

    @Enumerated(EnumType.STRING)
    @Column(name = "loan_status", nullable = false, length = 30)
    private LoanStatus loanStatus = LoanStatus.ACTIVE;

    @Column(name = "remaining_principal", nullable = false, precision = 15, scale = 2)
    private BigDecimal remainingPrincipal;

    @Column(name = "total_principal_paid", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalPrincipalPaid = BigDecimal.ZERO;

    @Column(name = "total_interest_paid", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalInterestPaid = BigDecimal.ZERO;

    @Column(name = "last_interest_calculated_date")
    private LocalDate lastInterestCalculatedDate;

    @Column(name = "purpose", length = 255)
    private String purpose;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL, orphanRemoval = false, fetch = FetchType.LAZY)
    private List<PaymentRecord> paymentRecords = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL, orphanRemoval = false, fetch = FetchType.LAZY)
    private List<CollateralDocument> collateralDocuments = new ArrayList<>();

    public Loan() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.remainingPrincipal == null) {
            this.remainingPrincipal = this.principalAmount;
        }
        if (this.totalPrincipalPaid == null) {
            this.totalPrincipalPaid = BigDecimal.ZERO;
        }
        if (this.totalInterestPaid == null) {
            this.totalInterestPaid = BigDecimal.ZERO;
        }
        if (this.lastInterestCalculatedDate == null) {
            this.lastInterestCalculatedDate = this.startDate;
        }
        if (this.loanStatus == null) {
            this.loanStatus = LoanStatus.ACTIVE;
        }
        if (this.interestType == null) {
            this.interestType = InterestType.VATTI_PER_HUNDRED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLoanNumber() {
        return loanNumber;
    }

    public void setLoanNumber(String loanNumber) {
        this.loanNumber = loanNumber;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public BigDecimal getPrincipalAmount() {
        return principalAmount;
    }

    public void setPrincipalAmount(BigDecimal principalAmount) {
        this.principalAmount = principalAmount;
    }

    public BigDecimal getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(BigDecimal interestRate) {
        this.interestRate = interestRate;
    }

    public InterestType getInterestType() {
        return interestType;
    }

    public void setInterestType(InterestType interestType) {
        this.interestType = interestType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public LoanStatus getLoanStatus() {
        return loanStatus;
    }

    public void setLoanStatus(LoanStatus loanStatus) {
        this.loanStatus = loanStatus;
    }

    public BigDecimal getRemainingPrincipal() {
        return remainingPrincipal;
    }

    public void setRemainingPrincipal(BigDecimal remainingPrincipal) {
        this.remainingPrincipal = remainingPrincipal;
    }

    public BigDecimal getTotalPrincipalPaid() {
        return totalPrincipalPaid;
    }

    public void setTotalPrincipalPaid(BigDecimal totalPrincipalPaid) {
        this.totalPrincipalPaid = totalPrincipalPaid;
    }

    public BigDecimal getTotalInterestPaid() {
        return totalInterestPaid;
    }

    public void setTotalInterestPaid(BigDecimal totalInterestPaid) {
        this.totalInterestPaid = totalInterestPaid;
    }

    public LocalDate getLastInterestCalculatedDate() {
        return lastInterestCalculatedDate;
    }

    public void setLastInterestCalculatedDate(LocalDate lastInterestCalculatedDate) {
        this.lastInterestCalculatedDate = lastInterestCalculatedDate;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<PaymentRecord> getPaymentRecords() {
        return paymentRecords;
    }

    public void setPaymentRecords(List<PaymentRecord> paymentRecords) {
        this.paymentRecords = paymentRecords;
    }

    public List<CollateralDocument> getCollateralDocuments() {
        return collateralDocuments;
    }

    public void setCollateralDocuments(List<CollateralDocument> collateralDocuments) {
        this.collateralDocuments = collateralDocuments;
    }
}
