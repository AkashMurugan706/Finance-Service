package com.finance.smsfinance.service.impl;

import com.finance.smsfinance.dto.DashboardStatsDto;
import com.finance.smsfinance.dto.LoanRequestDto;
import com.finance.smsfinance.dto.LoanResponseDto;
import com.finance.smsfinance.entity.Customer;
import com.finance.smsfinance.entity.Loan;
import com.finance.smsfinance.exception.BusinessException;
import com.finance.smsfinance.exception.DuplicateResourceException;
import com.finance.smsfinance.exception.ResourceNotFoundException;
import com.finance.smsfinance.model.InterestType;
import com.finance.smsfinance.model.LoanStatus;
import com.finance.smsfinance.repository.CollateralRepository;
import com.finance.smsfinance.repository.CustomerRepository;
import com.finance.smsfinance.repository.LoanRepository;
import com.finance.smsfinance.repository.PaymentRepository;
import com.finance.smsfinance.service.LoanService;
import com.finance.smsfinance.service.VattiCalculationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class LoanServiceImpl implements LoanService {

    private final LoanRepository loanRepository;
    private final CustomerRepository customerRepository;
    private final CollateralRepository collateralRepository;
    private final PaymentRepository paymentRepository;
    private final VattiCalculationService vattiCalculationService;

    public LoanServiceImpl(LoanRepository loanRepository,
                           CustomerRepository customerRepository,
                           CollateralRepository collateralRepository,
                           PaymentRepository paymentRepository,
                           VattiCalculationService vattiCalculationService) {
        this.loanRepository = loanRepository;
        this.customerRepository = customerRepository;
        this.collateralRepository = collateralRepository;
        this.paymentRepository = paymentRepository;
        this.vattiCalculationService = vattiCalculationService;
    }

    @Override
    public LoanResponseDto createLoan(LoanRequestDto request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        if (!Boolean.TRUE.equals(customer.getActive())) {
            throw new BusinessException("Cannot issue a new loan to an inactive customer (" + customer.getCustomerCode() + ")");
        }

        Loan loan = new Loan();
        loan.setLoanNumber(generateLoanNumber(request.getLoanNumber()));
        loan.setCustomer(customer);
        loan.setPrincipalAmount(request.getPrincipalAmount().setScale(2, RoundingMode.HALF_UP));
        loan.setRemainingPrincipal(request.getPrincipalAmount().setScale(2, RoundingMode.HALF_UP));
        loan.setInterestRate(request.getInterestRate().setScale(2, RoundingMode.HALF_UP));
        loan.setInterestType(request.getInterestType() != null ? request.getInterestType() : InterestType.VATTI_PER_HUNDRED);
        loan.setStartDate(request.getStartDate());
        loan.setDueDate(request.getDueDate() != null ? request.getDueDate() :
                (request.getTenureMonths() != null ? request.getStartDate().plusMonths(request.getTenureMonths()) : null));
        loan.setTenureMonths(request.getTenureMonths());
        loan.setLoanStatus(request.getLoanStatus() != null ? request.getLoanStatus() : LoanStatus.ACTIVE);
        loan.setPurpose(request.getPurpose());
        loan.setNotes(request.getNotes());
        loan.setTotalPrincipalPaid(BigDecimal.ZERO);
        loan.setTotalInterestPaid(BigDecimal.ZERO);
        loan.setLastInterestCalculatedDate(request.getStartDate());

        Loan saved = loanRepository.save(loan);
        return mapToDto(saved);
    }

    @Override
    public LoanResponseDto updateLoan(Long id, LoanRequestDto request) {
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan", "id", id));

        if (loan.getLoanStatus() == LoanStatus.CLOSED) {
            throw new BusinessException("Cannot update terms on a CLOSED loan (" + loan.getLoanNumber() + ")");
        }

        if (request.getInterestRate() != null) {
            loan.setInterestRate(request.getInterestRate().setScale(2, RoundingMode.HALF_UP));
        }
        if (request.getInterestType() != null) {
            loan.setInterestType(request.getInterestType());
        }
        if (request.getDueDate() != null) {
            loan.setDueDate(request.getDueDate());
        }
        if (request.getTenureMonths() != null) {
            loan.setTenureMonths(request.getTenureMonths());
        }
        if (request.getLoanStatus() != null) {
            loan.setLoanStatus(request.getLoanStatus());
        }
        if (request.getPurpose() != null) {
            loan.setPurpose(request.getPurpose());
        }
        if (request.getNotes() != null) {
            loan.setNotes(request.getNotes());
        }

        Loan updated = loanRepository.save(loan);
        return mapToDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public LoanResponseDto getLoanById(Long id) {
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan", "id", id));
        return mapToDto(loan);
    }

    @Override
    @Transactional(readOnly = true)
    public LoanResponseDto getLoanByLoanNumber(String loanNumber) {
        Loan loan = loanRepository.findByLoanNumber(loanNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Loan", "loanNumber", loanNumber));
        return mapToDto(loan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoanResponseDto> getAllLoans() {
        return loanRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoanResponseDto> getLoansByCustomer(Long customerId) {
        return loanRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoanResponseDto> getLoansByStatus(LoanStatus status) {
        return loanRepository.findByLoanStatus(status).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoanResponseDto> searchLoans(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllLoans();
        }
        return loanRepository.searchLoans(keyword.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public LoanResponseDto closeLoan(Long id, String notes) {
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan", "id", id));

        if (loan.getRemainingPrincipal().compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("Cannot close loan " + loan.getLoanNumber() + " because outstanding principal balance is ₹" + loan.getRemainingPrincipal());
        }

        loan.setLoanStatus(LoanStatus.CLOSED);
        if (notes != null && !notes.trim().isEmpty()) {
            String updatedNotes = (loan.getNotes() != null ? loan.getNotes() + " | " : "") + "Closure note: " + notes;
            loan.setNotes(updatedNotes);
        }
        Loan saved = loanRepository.save(loan);
        return mapToDto(saved);
    }

    @Override
    public LoanResponseDto recalculateLoanInterest(Long id, LocalDate asOfDate) {
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan", "id", id));
        LocalDate calcDate = asOfDate != null ? asOfDate : LocalDate.now();
        loan.setLastInterestCalculatedDate(calcDate);
        loanRepository.save(loan);
        return mapToDto(loan, calcDate);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalCustomers(customerRepository.count());
        stats.setTotalActiveLoans(loanRepository.countByLoanStatus(LoanStatus.ACTIVE));
        stats.setTotalClosedLoans(loanRepository.countByLoanStatus(LoanStatus.CLOSED));
        stats.setTotalPrincipalDisbursed(loanRepository.sumActivePrincipalAmount());
        stats.setTotalActivePrincipalOutstanding(loanRepository.sumActiveRemainingPrincipal());
        stats.setTotalCollectionsReceived(paymentRepository.sumTotalCollections());
        stats.setTotalInterestCollected(paymentRepository.sumTotalInterestCollected());
        stats.setTotalPrincipalCollected(paymentRepository.sumTotalPrincipalCollected());
        stats.setTotalPledgedCollaterals(collateralRepository.findByStatus(com.finance.smsfinance.model.CollateralStatus.PLEDGED).size());
        stats.setTotalPledgedCollateralValue(collateralRepository.sumPledgedCollateralValue());
        return stats;
    }

    private String generateLoanNumber(String customLoanNumber) {
        if (customLoanNumber != null && !customLoanNumber.trim().isEmpty()) {
            String sanitized = customLoanNumber.trim().toUpperCase();
            if (loanRepository.existsByLoanNumber(sanitized)) {
                throw new DuplicateResourceException("Loan number '" + sanitized + "' already exists");
            }
            return sanitized;
        }
        int currentYear = LocalDate.now().getYear();
        long count = loanRepository.count() + 1001;
        String generated = "LN-" + currentYear + "-" + count;
        while (loanRepository.existsByLoanNumber(generated)) {
            generated = "LN-" + currentYear + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        }
        return generated;
    }

    private LoanResponseDto mapToDto(Loan loan) {
        return mapToDto(loan, LocalDate.now());
    }

    private LoanResponseDto mapToDto(Loan loan, LocalDate asOfDate) {
        LoanResponseDto dto = new LoanResponseDto();
        dto.setId(loan.getId());
        dto.setLoanNumber(loan.getLoanNumber());
        dto.setCustomerId(loan.getCustomer().getId());
        dto.setCustomerCode(loan.getCustomer().getCustomerCode());
        dto.setCustomerName(loan.getCustomer().getFullName());
        dto.setCustomerPhone(loan.getCustomer().getPhoneNumber());
        dto.setPrincipalAmount(loan.getPrincipalAmount());
        dto.setInterestRate(loan.getInterestRate());
        dto.setInterestType(loan.getInterestType());
        dto.setInterestTypeDescription(loan.getInterestType().getDescription());
        dto.setStartDate(loan.getStartDate());
        dto.setDueDate(loan.getDueDate());
        dto.setTenureMonths(loan.getTenureMonths());
        dto.setLoanStatus(loan.getLoanStatus());
        dto.setRemainingPrincipal(loan.getRemainingPrincipal());
        dto.setTotalPrincipalPaid(loan.getTotalPrincipalPaid());
        dto.setTotalInterestPaid(loan.getTotalInterestPaid());
        dto.setPurpose(loan.getPurpose());
        dto.setNotes(loan.getNotes());
        dto.setCreatedAt(loan.getCreatedAt());

        long daysElapsed = Math.max(0, ChronoUnit.DAYS.between(loan.getStartDate(), asOfDate));
        dto.setDaysElapsed(daysElapsed);

        // Calculate dynamic monthly interest & accrued interest
        BigDecimal monthlyInterest = vattiCalculationService.calculateMonthlyInterest(
                loan.getRemainingPrincipal(), loan.getInterestRate(), loan.getInterestType()
        );
        dto.setMonthlyInterestAmount(monthlyInterest);

        // Accrued interest on current remaining principal from last calculation/start date
        LocalDate fromDate = (loan.getLastInterestCalculatedDate() != null) ? loan.getLastInterestCalculatedDate() : loan.getStartDate();
        BigDecimal accruedInterest = vattiCalculationService.calculateAccruedInterest(
                loan.getRemainingPrincipal(), loan.getInterestRate(), loan.getInterestType(), fromDate, asOfDate
        );
        dto.setAccruedInterestToDate(accruedInterest);
        dto.setTotalEstimatedOutstanding(loan.getRemainingPrincipal().add(accruedInterest).setScale(2, RoundingMode.HALF_UP));

        if (loan.getPaymentRecords() != null) {
            dto.setPaymentRecordsCount(loan.getPaymentRecords().size());
        }
        if (loan.getCollateralDocuments() != null) {
            dto.setCollateralCount(loan.getCollateralDocuments().size());
        }

        return dto;
    }
}
