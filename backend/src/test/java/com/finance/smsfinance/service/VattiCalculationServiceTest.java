package com.finance.smsfinance.service;

import com.finance.smsfinance.dto.InterestCalculationRequestDto;
import com.finance.smsfinance.dto.InterestCalculationResponseDto;
import com.finance.smsfinance.model.InterestType;
import com.finance.smsfinance.service.impl.VattiCalculationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class VattiCalculationServiceTest {

    private VattiCalculationService vattiCalculationService;

    @BeforeEach
    void setUp() {
        vattiCalculationService = new VattiCalculationServiceImpl();
    }

    @Test
    @DisplayName("Should calculate monthly Vatti interest: ₹1,00,000 at ₹2 per ₹100 = ₹2,000/month")
    void testCalculateMonthlyVattiInterest() {
        BigDecimal principal = new BigDecimal("100000.00");
        BigDecimal rate = new BigDecimal("2.00"); // ₹2 per 100/mo

        BigDecimal monthlyInterest = vattiCalculationService.calculateMonthlyInterest(
                principal, rate, InterestType.VATTI_PER_HUNDRED
        );

        assertEquals(new BigDecimal("2000.00"), monthlyInterest);
    }

    @Test
    @DisplayName("Should calculate accrued interest for 60 days (2 months): ₹1,00,000 @ ₹2 vatti = ₹4,000")
    void testAccruedInterestTwoMonths() {
        BigDecimal principal = new BigDecimal("100000.00");
        BigDecimal rate = new BigDecimal("2.00");
        LocalDate start = LocalDate.of(2026, 1, 1);
        LocalDate to = start.plusDays(60);

        BigDecimal accrued = vattiCalculationService.calculateAccruedInterest(
                principal, rate, InterestType.VATTI_PER_HUNDRED, start, to
        );

        assertEquals(new BigDecimal("4000.00"), accrued);
    }

    @Test
    @DisplayName("Should calculate breakdown with annual equivalent rate (2% monthly = 24% p.a.)")
    void testBreakdownCalculation() {
        InterestCalculationRequestDto req = new InterestCalculationRequestDto();
        req.setPrincipalAmount(new BigDecimal("50000.00"));
        req.setRate(new BigDecimal("2.00"));
        req.setInterestType(InterestType.VATTI_PER_HUNDRED);
        req.setStartDate(LocalDate.of(2026, 1, 1));
        req.setCalculationDate(LocalDate.of(2026, 2, 1)); // 31 days

        InterestCalculationResponseDto response = vattiCalculationService.calculateBreakdown(req);

        assertNotNull(response);
        assertEquals(new BigDecimal("1000.00"), response.getMonthlyInterest());
        assertEquals(new BigDecimal("24.00"), response.getAnnualEquivalentRate());
        assertTrue(response.getTotalAccruedInterest().compareTo(new BigDecimal("1000.00")) >= 0);
    }
}
