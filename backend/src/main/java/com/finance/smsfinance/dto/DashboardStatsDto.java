package com.finance.smsfinance.dto;

import java.math.BigDecimal;

public class DashboardStatsDto {

    private long totalCustomers;
    private long totalActiveLoans;
    private long totalClosedLoans;
    private BigDecimal totalPrincipalDisbursed;
    private BigDecimal totalActivePrincipalOutstanding;
    private BigDecimal totalCollectionsReceived;
    private BigDecimal totalInterestCollected;
    private BigDecimal totalPrincipalCollected;
    private long totalPledgedCollaterals;
    private BigDecimal totalPledgedCollateralValue;

    public DashboardStatsDto() {
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalActiveLoans() {
        return totalActiveLoans;
    }

    public void setTotalActiveLoans(long totalActiveLoans) {
        this.totalActiveLoans = totalActiveLoans;
    }

    public long getTotalClosedLoans() {
        return totalClosedLoans;
    }

    public void setTotalClosedLoans(long totalClosedLoans) {
        this.totalClosedLoans = totalClosedLoans;
    }

    public BigDecimal getTotalPrincipalDisbursed() {
        return totalPrincipalDisbursed;
    }

    public void setTotalPrincipalDisbursed(BigDecimal totalPrincipalDisbursed) {
        this.totalPrincipalDisbursed = totalPrincipalDisbursed;
    }

    public BigDecimal getTotalActivePrincipalOutstanding() {
        return totalActivePrincipalOutstanding;
    }

    public void setTotalActivePrincipalOutstanding(BigDecimal totalActivePrincipalOutstanding) {
        this.totalActivePrincipalOutstanding = totalActivePrincipalOutstanding;
    }

    public BigDecimal getTotalCollectionsReceived() {
        return totalCollectionsReceived;
    }

    public void setTotalCollectionsReceived(BigDecimal totalCollectionsReceived) {
        this.totalCollectionsReceived = totalCollectionsReceived;
    }

    public BigDecimal getTotalInterestCollected() {
        return totalInterestCollected;
    }

    public void setTotalInterestCollected(BigDecimal totalInterestCollected) {
        this.totalInterestCollected = totalInterestCollected;
    }

    public BigDecimal getTotalPrincipalCollected() {
        return totalPrincipalCollected;
    }

    public void setTotalPrincipalCollected(BigDecimal totalPrincipalCollected) {
        this.totalPrincipalCollected = totalPrincipalCollected;
    }

    public long getTotalPledgedCollaterals() {
        return totalPledgedCollaterals;
    }

    public void setTotalPledgedCollaterals(long totalPledgedCollaterals) {
        this.totalPledgedCollaterals = totalPledgedCollaterals;
    }

    public BigDecimal getTotalPledgedCollateralValue() {
        return totalPledgedCollateralValue;
    }

    public void setTotalPledgedCollateralValue(BigDecimal totalPledgedCollateralValue) {
        this.totalPledgedCollateralValue = totalPledgedCollateralValue;
    }
}
