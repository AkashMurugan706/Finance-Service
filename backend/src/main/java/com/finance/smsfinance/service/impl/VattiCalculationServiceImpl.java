package com.finance.smsfinance.service.impl;

import com.finance.smsfinance.dto.InterestCalculationRequestDto;
import com.finance.smsfinance.dto.InterestCalculationResponseDto;
import com.finance.smsfinance.model.InterestType;
import com.finance.smsfinance.service.VattiCalculationService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class VattiCalculationServiceImpl implements VattiCalculationService {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");
    private static final BigDecimal TWELVE = new BigDecimal("12");
    private static final BigDecimal THIRTY = new BigDecimal("30");
    private static final BigDecimal THREE_SIXTY_FIVE = new BigDecimal("365");

    @Override
    public BigDecimal calculateMonthlyInterest(BigDecimal principal, BigDecimal rate, InterestType interestType) {
        if (principal == null || rate == null || principal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        InterestType type = (interestType != null) ? interestType : InterestType.VATTI_PER_HUNDRED;

        switch (type) {
            case VATTI_PER_HUNDRED:
                // Rate is Rupees per ₹100 per month (e.g. ₹2.00 per ₹100 = 2% per month)
                // monthlyInterest = (Principal / 100) * Rate
                return principal
                        .divide(ONE_HUNDRED, 4, RoundingMode.HALF_UP)
                        .multiply(rate)
                        .setScale(2, RoundingMode.HALF_UP);

            case SIMPLE_MONTHLY:
            case COMPOUND_MONTHLY:
                // Rate is monthly percentage %
                return principal
                        .multiply(rate)
                        .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);

            case FLAT_ANNUAL:
                // Rate is annual percentage %
                return principal
                        .multiply(rate)
                        .divide(ONE_HUNDRED, 4, RoundingMode.HALF_UP)
                        .divide(TWELVE, 2, RoundingMode.HALF_UP);

            default:
                return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
    }

    @Override
    public BigDecimal calculateAccruedInterest(BigDecimal principal, BigDecimal rate, InterestType interestType,
                                                LocalDate startDate, LocalDate toDate) {
        if (principal == null || rate == null || startDate == null || toDate == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        if (toDate.isBefore(startDate)) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        long totalDays = ChronoUnit.DAYS.between(startDate, toDate);
        if (totalDays <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        InterestType type = (interestType != null) ? interestType : InterestType.VATTI_PER_HUNDRED;
        BigDecimal monthlyInterest = calculateMonthlyInterest(principal, rate, type);

        switch (type) {
            case VATTI_PER_HUNDRED:
            case SIMPLE_MONTHLY: {
                // In community finance, interest is calculated by full months plus remaining days (daily rate = monthly / 30)
                long fullMonths = totalDays / 30;
                long remainingDays = totalDays % 30;

                BigDecimal monthsInterest = monthlyInterest.multiply(BigDecimal.valueOf(fullMonths));
                BigDecimal dailyInterest = monthlyInterest.divide(THIRTY, 4, RoundingMode.HALF_UP);
                BigDecimal daysInterest = dailyInterest.multiply(BigDecimal.valueOf(remainingDays));

                return monthsInterest.add(daysInterest).setScale(2, RoundingMode.HALF_UP);
            }

            case COMPOUND_MONTHLY: {
                // Compound monthly: P * (1 + r/100)^months
                long fullMonths = totalDays / 30;
                long remainingDays = totalDays % 30;

                BigDecimal monthlyRateFactor = rate.divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP);
                BigDecimal multiplier = BigDecimal.ONE.add(monthlyRateFactor);

                BigDecimal compoundPrincipal = principal;
                for (int i = 0; i < fullMonths; i++) {
                    compoundPrincipal = compoundPrincipal.multiply(multiplier, MathContext.DECIMAL128);
                }

                // Plus fractional month simple daily interest on the compounded principal
                BigDecimal dailyInterest = compoundPrincipal.multiply(monthlyRateFactor)
                        .divide(THIRTY, 4, RoundingMode.HALF_UP);
                BigDecimal daysInterest = dailyInterest.multiply(BigDecimal.valueOf(remainingDays));

                BigDecimal totalCompounded = compoundPrincipal.add(daysInterest);
                return totalCompounded.subtract(principal).setScale(2, RoundingMode.HALF_UP);
            }

            case FLAT_ANNUAL: {
                // Flat annual: Principal * (Rate / 100) * (Days / 365)
                BigDecimal annualInterest = principal.multiply(rate).divide(ONE_HUNDRED, 4, RoundingMode.HALF_UP);
                return annualInterest.multiply(BigDecimal.valueOf(totalDays))
                        .divide(THREE_SIXTY_FIVE, 2, RoundingMode.HALF_UP);
            }

            default:
                return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
    }

    @Override
    public InterestCalculationResponseDto calculateBreakdown(InterestCalculationRequestDto request) {
        LocalDate startDate = request.getStartDate();
        LocalDate toDate = (request.getCalculationDate() != null) ? request.getCalculationDate() : LocalDate.now();
        InterestType type = (request.getInterestType() != null) ? request.getInterestType() : InterestType.VATTI_PER_HUNDRED;

        long totalDays = Math.max(0, ChronoUnit.DAYS.between(startDate, toDate));
        long fullMonths = totalDays / 30;
        long remainingDays = totalDays % 30;

        BigDecimal monthlyInterest = calculateMonthlyInterest(request.getPrincipalAmount(), request.getRate(), type);
        BigDecimal dailyInterest = monthlyInterest.divide(THIRTY, 2, RoundingMode.HALF_UP);
        BigDecimal totalAccrued = calculateAccruedInterest(request.getPrincipalAmount(), request.getRate(), type, startDate, toDate);
        BigDecimal totalPayable = request.getPrincipalAmount().add(totalAccrued);

        BigDecimal annualEquivalentRate;
        if (type == InterestType.VATTI_PER_HUNDRED || type == InterestType.SIMPLE_MONTHLY || type == InterestType.COMPOUND_MONTHLY) {
            annualEquivalentRate = request.getRate().multiply(TWELVE).setScale(2, RoundingMode.HALF_UP);
        } else {
            annualEquivalentRate = request.getRate().setScale(2, RoundingMode.HALF_UP);
        }

        String explanation = String.format(
                "Principal: ₹%s | %d full months + %d days (%d days total). Monthly interest: ₹%s. Accrued interest: ₹%s",
                request.getPrincipalAmount().toPlainString(), fullMonths, remainingDays, totalDays,
                monthlyInterest.toPlainString(), totalAccrued.toPlainString()
        );

        InterestCalculationResponseDto response = new InterestCalculationResponseDto();
        response.setPrincipalAmount(request.getPrincipalAmount().setScale(2, RoundingMode.HALF_UP));
        response.setRate(request.getRate().setScale(2, RoundingMode.HALF_UP));
        response.setInterestType(type);
        response.setStartDate(startDate);
        response.setCalculationDate(toDate);
        response.setTotalDays(totalDays);
        response.setFullMonths(fullMonths);
        response.setRemainingDays(remainingDays);
        response.setDailyInterest(dailyInterest);
        response.setMonthlyInterest(monthlyInterest);
        response.setTotalAccruedInterest(totalAccrued);
        response.setTotalPayable(totalPayable.setScale(2, RoundingMode.HALF_UP));
        response.setAnnualEquivalentRate(annualEquivalentRate);
        response.setCalculationExplanation(explanation);

        return response;
    }
}
