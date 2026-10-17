package com.finance.smsfinance.service.impl;

import com.finance.smsfinance.dto.PaymentRequestDto;
import com.finance.smsfinance.dto.PaymentResponseDto;
import com.finance.smsfinance.entity.Loan;
import com.finance.smsfinance.entity.PaymentRecord;
import com.finance.smsfinance.exception.BusinessException;
import com.finance.smsfinance.exception.DuplicateResourceException;
import com.finance.smsfinance.exception.InvalidPaymentException;
import com.finance.smsfinance.exception.ResourceNotFoundException;
import com.finance.smsfinance.model.LoanStatus;
import com.finance.smsfinance.model.PaymentType;
import com.finance.smsfinance.repository.LoanRepository;
import com.finance.smsfinance.repository.PaymentRepository;
import com.finance.smsfinance.service.PaymentService;
import com.finance.smsfinance.service.VattiCalculationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final LoanRepository loanRepository;
    private final VattiCalculationService vattiCalculationService;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              LoanRepository loanRepository,
                              VattiCalculationService vattiCalculationService) {
        this.paymentRepository = paymentRepository;
        this.loanRepository = loanRepository;
        this.vattiCalculationService = vattiCalculationService;
    }

    @Override
    public PaymentResponseDto recordPayment(PaymentRequestDto request) {
        Loan loan = loanRepository.findById(request.getLoanId())
                .orElseThrow(() -> new ResourceNotFoundException("Loan", "id", request.getLoanId()));

        if (loan.getLoanStatus() == LoanStatus.CLOSED) {
            throw new BusinessException("Cannot process payment for CLOSED loan " + loan.getLoanNumber());
        }

        BigDecimal amountPaid = request.getAmountPaid().setScale(2, RoundingMode.HALF_UP);
        if (amountPaid.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidPaymentException("Payment amount must be greater than zero");
        }

        LocalDate paymentDate = request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now();
        if (paymentDate.isBefore(loan.getStartDate())) {
            throw new InvalidPaymentException("Payment date (" + paymentDate + ") cannot be earlier than loan start date (" + loan.getStartDate() + ")");
        }

        BigDecimal interestPortion;
        BigDecimal principalPortion;
        BigDecimal penaltyPortion = (request.getPenaltyPortion() != null) ?
                request.getPenaltyPortion().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        if (Boolean.TRUE.equals(request.getAutoAllocate())) {
            // Auto allocate payment: calculate accrued interest since last calculation date
            LocalDate fromDate = (loan.getLastInterestCalculatedDate() != null) ? loan.getLastInterestCalculatedDate() : loan.getStartDate();
            BigDecimal accruedInterest = vattiCalculationService.calculateAccruedInterest(
                    loan.getRemainingPrincipal(), loan.getInterestRate(), loan.getInterestType(), fromDate, paymentDate
            );

            // Deduct penalty first if any
            BigDecimal remainingAfterPenalty = amountPaid.subtract(penaltyPortion);
            if (remainingAfterPenalty.compareTo(BigDecimal.ZERO) < 0) {
                throw new InvalidPaymentException("Payment amount is insufficient to cover the specified penalty");
            }

            if (remainingAfterPenalty.compareTo(accruedInterest) <= 0) {
                // Payment only partially covers or exactly covers accrued interest
                interestPortion = remainingAfterPenalty;
                principalPortion = BigDecimal.ZERO;
            } else {
                // Payment clears interest, remaining reduces principal
                interestPortion = accruedInterest;
                BigDecimal candidatePrincipal = remainingAfterPenalty.subtract(accruedInterest);

                if (candidatePrincipal.compareTo(loan.getRemainingPrincipal()) > 0) {
                    // Excess amount exceeds remaining principal
                    principalPortion = loan.getRemainingPrincipal();
                } else {
                    principalPortion = candidatePrincipal;
                }
            }
        } else {
            // Manual allocation provided
            interestPortion = (request.getInterestPortion() != null) ?
                    request.getInterestPortion().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            principalPortion = (request.getPrincipalPortion() != null) ?
                    request.getPrincipalPortion().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

            BigDecimal sumAllocated = interestPortion.add(principalPortion).add(penaltyPortion);
            if (sumAllocated.compareTo(amountPaid) != 0) {
                throw new InvalidPaymentException(String.format(
                        "Allocated portions (Interest: %s + Principal: %s + Penalty: %s = %s) must exactly match total amount paid (%s)",
                        interestPortion, principalPortion, penaltyPortion, sumAllocated, amountPaid
                ));
            }

            if (principalPortion.compareTo(loan.getRemainingPrincipal()) > 0) {
                throw new InvalidPaymentException(String.format(
                        "Principal payment portion (₹%s) cannot exceed current remaining principal (₹%s)",
                        principalPortion, loan.getRemainingPrincipal()
                ));
            }
        }

        // Update Loan state
        BigDecimal newRemainingPrincipal = loan.getRemainingPrincipal().subtract(principalPortion).setScale(2, RoundingMode.HALF_UP);
        loan.setRemainingPrincipal(newRemainingPrincipal);
        loan.setTotalPrincipalPaid(loan.getTotalPrincipalPaid().add(principalPortion).setScale(2, RoundingMode.HALF_UP));
        loan.setTotalInterestPaid(loan.getTotalInterestPaid().add(interestPortion).setScale(2, RoundingMode.HALF_UP));
        loan.setLastInterestCalculatedDate(paymentDate);

        // Auto close if principal is fully settled
        if (newRemainingPrincipal.compareTo(BigDecimal.ZERO) <= 0) {
            loan.setLoanStatus(LoanStatus.CLOSED);
        }
        loanRepository.save(loan);

        // Create PaymentRecord
        PaymentRecord record = new PaymentRecord();
        record.setReceiptNumber(generateReceiptNumber(request.getReceiptNumber()));
        record.setLoan(loan);
        record.setCustomer(loan.getCustomer());
        record.setPaymentDate(paymentDate);
        record.setAmountPaid(amountPaid);
        record.setInterestPortion(interestPortion);
        record.setPrincipalPortion(principalPortion);
        record.setPenaltyPortion(penaltyPortion);
        record.setPrincipalBalanceAfter(newRemainingPrincipal);
        record.setPaymentType(request.getPaymentType() != null ? request.getPaymentType() : PaymentType.CASH);
        record.setTransactionReference(request.getTransactionReference());
        record.setNotes(request.getNotes());
        record.setRecordedBy(request.getRecordedBy() != null ? request.getRecordedBy() : "Admin / Cashier");

        PaymentRecord saved = paymentRepository.save(record);
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDto getPaymentById(Long id) {
        PaymentRecord record = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentRecord", "id", id));
        return mapToDto(record);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDto getPaymentByReceiptNumber(String receiptNumber) {
        PaymentRecord record = paymentRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentRecord", "receiptNumber", receiptNumber));
        return mapToDto(record);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponseDto> getPaymentsByLoan(Long loanId) {
        return paymentRepository.findByLoanIdOrderByPaymentDateDesc(loanId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponseDto> getPaymentsByCustomer(Long customerId) {
        return paymentRepository.findByCustomerIdOrderByPaymentDateDesc(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponseDto> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponseDto> searchPayments(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllPayments();
        }
        return paymentRepository.searchPayments(query.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private String generateReceiptNumber(String customReceiptNumber) {
        if (customReceiptNumber != null && !customReceiptNumber.trim().isEmpty()) {
            String sanitized = customReceiptNumber.trim().toUpperCase();
            if (paymentRepository.findByReceiptNumber(sanitized).isPresent()) {
                throw new DuplicateResourceException("Receipt number '" + sanitized + "' already exists");
            }
            return sanitized;
        }
        int year = LocalDate.now().getYear();
        long count = paymentRepository.count() + 10001;
        String generated = "REC-" + year + "-" + count;
        while (paymentRepository.findByReceiptNumber(generated).isPresent()) {
            generated = "REC-" + year + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        }
        return generated;
    }

    private PaymentResponseDto mapToDto(PaymentRecord record) {
        PaymentResponseDto dto = new PaymentResponseDto();
        dto.setId(record.getId());
        dto.setReceiptNumber(record.getReceiptNumber());
        dto.setLoanId(record.getLoan().getId());
        dto.setLoanNumber(record.getLoan().getLoanNumber());
        dto.setCustomerId(record.getCustomer().getId());
        dto.setCustomerName(record.getCustomer().getFullName());
        dto.setCustomerPhone(record.getCustomer().getPhoneNumber());
        dto.setPaymentDate(record.getPaymentDate());
        dto.setAmountPaid(record.getAmountPaid());
        dto.setInterestPortion(record.getInterestPortion());
        dto.setPrincipalPortion(record.getPrincipalPortion());
        dto.setPenaltyPortion(record.getPenaltyPortion());
        dto.setPrincipalBalanceAfter(record.getPrincipalBalanceAfter());
        dto.setPaymentType(record.getPaymentType());
        dto.setTransactionReference(record.getTransactionReference());
        dto.setNotes(record.getNotes());
        dto.setRecordedBy(record.getRecordedBy());
        dto.setCreatedAt(record.getCreatedAt());
        return dto;
    }
}
