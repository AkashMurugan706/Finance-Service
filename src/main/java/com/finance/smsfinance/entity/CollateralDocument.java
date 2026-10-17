package com.finance.smsfinance.entity;

import com.finance.smsfinance.model.CollateralStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "collateral_documents", indexes = {
    @Index(name = "idx_collateral_status", columnList = "status"),
    @Index(name = "idx_collateral_customer", columnList = "customer_id"),
    @Index(name = "idx_collateral_loan", columnList = "loan_id")
})
public class CollateralDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "loan_id")
    private Loan loan;

    @NotBlank(message = "Document type is required (e.g. PROPERTY_DEED, VEHICLE_RC, GOLD_VALUATION, CHEQUE)")
    @Column(name = "document_type", nullable = false, length = 60)
    private String documentType;

    @NotBlank(message = "Document / Asset identification number is required")
    @Column(name = "document_number", nullable = false, length = 100)
    private String documentNumber;

    @NotBlank(message = "Document title or description is required")
    @Column(name = "title_or_description", nullable = false, length = 500)
    private String titleOrDescription;

    @Column(name = "estimated_value", precision = 15, scale = 2)
    private BigDecimal estimatedValue;

    @Column(name = "vault_storage_location", length = 120)
    private String vaultStorageLocation;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private CollateralStatus status = CollateralStatus.PLEDGED;

    @Column(name = "document_file_url", columnDefinition = "TEXT")
    private String documentFileUrl;

    @NotNull(message = "Pledge date is required")
    @Column(name = "pledge_date", nullable = false)
    private LocalDate pledgeDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(name = "verified_by", length = 100)
    private String verifiedBy;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CollateralDocument() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = CollateralStatus.PLEDGED;
        }
        if (this.pledgeDate == null) {
            this.pledgeDate = LocalDate.now();
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

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Loan getLoan() {
        return loan;
    }

    public void setLoan(Loan loan) {
        this.loan = loan;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getDocumentNumber() {
        return documentNumber;
    }

    public void setDocumentNumber(String documentNumber) {
        this.documentNumber = documentNumber;
    }

    public String getTitleOrDescription() {
        return titleOrDescription;
    }

    public void setTitleOrDescription(String titleOrDescription) {
        this.titleOrDescription = titleOrDescription;
    }

    public BigDecimal getEstimatedValue() {
        return estimatedValue;
    }

    public void setEstimatedValue(BigDecimal estimatedValue) {
        this.estimatedValue = estimatedValue;
    }

    public String getVaultStorageLocation() {
        return vaultStorageLocation;
    }

    public void setVaultStorageLocation(String vaultStorageLocation) {
        this.vaultStorageLocation = vaultStorageLocation;
    }

    public CollateralStatus getStatus() {
        return status;
    }

    public void setStatus(CollateralStatus status) {
        this.status = status;
    }

    public String getDocumentFileUrl() {
        return documentFileUrl;
    }

    public void setDocumentFileUrl(String documentFileUrl) {
        this.documentFileUrl = documentFileUrl;
    }

    public LocalDate getPledgeDate() {
        return pledgeDate;
    }

    public void setPledgeDate(LocalDate pledgeDate) {
        this.pledgeDate = pledgeDate;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public String getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy;
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
}
