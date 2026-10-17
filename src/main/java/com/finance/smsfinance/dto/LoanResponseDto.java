package com.finance.smsfinance.dto;

import com.finance.smsfinance.model.InterestType;
import com.finance.smsfinance.model.LoanStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class LoanResponseDto {

    private Long id;
    private String loanNumber;
    private Long customerId;
    private String customerCode;
    private String customerName;
    private String customerPhone;
    private BigDecimal principalAmount;
    private BigDecimal interestRate;
    private InterestType interestType;
    private String interestTypeDescription;
    private LocalDate startDate;
    private LocalDate dueDate;
    private Integer tenureMonths;
    private LoanStatus loanStatus;
    private BigDecimal remainingPrincipal;
    private BigDecimal totalPrincipalPaid;
    private BigDecimal totalInterestPaid;
    private BigDecimal monthlyInterestAmount;
    private BigDecimal accruedInterestToDate;
    private BigDecimal totalEstimatedOutstanding;
    private long daysElapsed;
    private String purpose;
    private String notes;
    private int paymentRecordsCount;
    private int collateralCount;
    private LocalDateTime createdAt;

    public LoanResponseDto() {
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

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerCode() {
        return customerCode;
    }

    public void setCustomerCode(String customerCode) {
        this.customerCode = customerCode;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
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

    public String getInterestTypeDescription() {
        return interestTypeDescription;
    }

    public void setInterestTypeDescription(String interestTypeDescription) {
        this.interestTypeDescription = interestTypeDescription;
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

    public BigDecimal getMonthlyInterestAmount() {
        return monthlyInterestAmount;
    }

    public void setMonthlyInterestAmount(BigDecimal monthlyInterestAmount) {
        this.monthlyInterestAmount = monthlyInterestAmount;
    }

    public BigDecimal getAccruedInterestToDate() {
        return accruedInterestToDate;
    }

    public void setAccruedInterestToDate(BigDecimal accruedInterestToDate) {
        this.accruedInterestToDate = accruedInterestToDate;
    }

    public BigDecimal getTotalEstimatedOutstanding() {
        return totalEstimatedOutstanding;
    }

    public void setTotalEstimatedOutstanding(BigDecimal totalEstimatedOutstanding) {
        this.totalEstimatedOutstanding = totalEstimatedOutstanding;
    }

    public long getDaysElapsed() {
        return daysElapsed;
    }

    public void setDaysElapsed(long daysElapsed) {
        this.daysElapsed = daysElapsed;
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

    public int getPaymentRecordsCount() {
        return paymentRecordsCount;
    }

    public void setPaymentRecordsCount(int paymentRecordsCount) {
        this.paymentRecordsCount = paymentRecordsCount;
    }

    public int getCollateralCount() {
        return collateralCount;
    }

    public void setCollateralCount(int collateralCount) {
        this.collateralCount = collateralCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
