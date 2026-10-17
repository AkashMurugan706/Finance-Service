package com.finance.smsfinance.dto;

import com.finance.smsfinance.model.InterestType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class InterestCalculationRequestDto {

    @NotNull(message = "Principal amount is required")
    @DecimalMin(value = "1.00", message = "Principal must be positive")
    private BigDecimal principalAmount;

    @NotNull(message = "Interest rate is required")
    @DecimalMin(value = "0.01", message = "Interest rate must be positive")
    private BigDecimal rate; // e.g. 2.00 for ₹2 vatti / ₹100 / month

    private InterestType interestType = InterestType.VATTI_PER_HUNDRED;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate calculationDate; // defaults to today if null

    public InterestCalculationRequestDto() {
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
}
