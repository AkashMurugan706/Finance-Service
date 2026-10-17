package com.finance.smsfinance.service;

import com.finance.smsfinance.dto.InterestCalculationRequestDto;
import com.finance.smsfinance.dto.InterestCalculationResponseDto;
import com.finance.smsfinance.model.InterestType;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * High-precision financial interest calculation engine using BigDecimal.
 * Handles Indian community lending models such as Vatti (Rupees per ₹100 / month),
 * Simple monthly, Compound monthly, and Flat annual.
 */
public interface VattiCalculationService {

    /**
     * Calculates monthly interest amount for a given principal and rate.
     */
    BigDecimal calculateMonthlyInterest(BigDecimal principal, BigDecimal rate, InterestType interestType);

    /**
     * Calculates accrued interest between two dates using BigDecimal.
     */
    BigDecimal calculateAccruedInterest(BigDecimal principal, BigDecimal rate, InterestType interestType,
                                        LocalDate startDate, LocalDate toDate);

    /**
     * Evaluates a full breakdown response for interest calculation requests.
     */
    InterestCalculationResponseDto calculateBreakdown(InterestCalculationRequestDto request);
}
