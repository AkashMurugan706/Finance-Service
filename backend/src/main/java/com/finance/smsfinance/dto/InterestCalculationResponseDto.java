package com.finance.smsfinance.dto;

import com.finance.smsfinance.model.InterestType;

import java.math.BigDecimal;
import java.time.LocalDate;

public class InterestCalculationResponseDto {

    private BigDecimal principalAmount;
    private BigDecimal rate;
    private InterestType interestType;
    private LocalDate startDate;
    private LocalDate calculationDate;
    private long totalDays;
    private long fullMonths;
    private long remainingDays;
    private BigDecimal dailyInterest;
    private BigDecimal monthlyInterest;
    private BigDecimal totalAccruedInterest;
    private BigDecimal totalPayable;
    private BigDecimal annualEquivalentRate;
    private String calculationExplanation;

    public InterestCalculationResponseDto() {
    }

    public BigDecimal getPrincipalAmount() {
        return principalAmount;
    }

    public void setPrincipalAmount(BigDecimal principalAmount) {
        this.principalAmount = principalAmount;
    }

    public BigDecimal getRate() {
        return rate;
    }

    public void setRate(BigDecimal rate) {
        this.rate = rate;
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

    public LocalDate getCalculationDate() {
        return calculationDate;
    }

    public void setCalculationDate(LocalDate calculationDate) {
        this.calculationDate = calculationDate;
    }

    public long getTotalDays() {
        return totalDays;
    }

    public void setTotalDays(long totalDays) {
        this.totalDays = totalDays;
    }

    public long getFullMonths() {
        return fullMonths;
    }

    public void setFullMonths(long fullMonths) {
        this.fullMonths = fullMonths;
    }

    public long getRemainingDays() {
        return remainingDays;
    }

    public void setRemainingDays(long remainingDays) {
        this.remainingDays = remainingDays;
    }

    public BigDecimal getDailyInterest() {
        return dailyInterest;
    }

    public void setDailyInterest(BigDecimal dailyInterest) {
        this.dailyInterest = dailyInterest;
    }

    public BigDecimal getMonthlyInterest() {
        return monthlyInterest;
    }

    public void setMonthlyInterest(BigDecimal monthlyInterest) {
        this.monthlyInterest = monthlyInterest;
    }

    public BigDecimal getTotalAccruedInterest() {
        return totalAccruedInterest;
    }

    public void setTotalAccruedInterest(BigDecimal totalAccruedInterest) {
        this.totalAccruedInterest = totalAccruedInterest;
    }

    public BigDecimal getTotalPayable() {
        return totalPayable;
    }

    public void setTotalPayable(BigDecimal totalPayable) {
        this.totalPayable = totalPayable;
    }

    public BigDecimal getAnnualEquivalentRate() {
        return annualEquivalentRate;
    }

    public void setAnnualEquivalentRate(BigDecimal annualEquivalentRate) {
        this.annualEquivalentRate = annualEquivalentRate;
    }

    public String getCalculationExplanation() {
        return calculationExplanation;
    }

    public void setCalculationExplanation(String calculationExplanation) {
        this.calculationExplanation = calculationExplanation;
    }
}
