package com.finance.smsfinance.dto;

import com.finance.smsfinance.model.CollateralStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CollateralRequestDto {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    private Long loanId;

    @NotBlank(message = "Document type is required (e.g. PROPERTY_DEED, VEHICLE_RC, GOLD_VALUATION, CHEQUE)")
    private String documentType;

    @NotBlank(message = "Document / Asset identification number is required")
    private String documentNumber;

    @NotBlank(message = "Document title or description is required")
    private String titleOrDescription;

    private BigDecimal estimatedValue;
    private String vaultStorageLocation;
    private CollateralStatus status = CollateralStatus.PLEDGED;
    private String documentFileUrl;
    private LocalDate pledgeDate;
    private LocalDate returnDate;
    private String verifiedBy;
    private String notes;

    public CollateralRequestDto() {
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getLoanId() {
        return loanId;
    }

    public void setLoanId(Long loanId) {
        this.loanId = loanId;
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
}
