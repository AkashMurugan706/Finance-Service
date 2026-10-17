package com.finance.smsfinance.service;

import com.finance.smsfinance.dto.DashboardStatsDto;
import com.finance.smsfinance.dto.LoanRequestDto;
import com.finance.smsfinance.dto.LoanResponseDto;
import com.finance.smsfinance.model.LoanStatus;

import java.time.LocalDate;
import java.util.List;

public interface LoanService {

    LoanResponseDto createLoan(LoanRequestDto request);

    LoanResponseDto updateLoan(Long id, LoanRequestDto request);

    LoanResponseDto getLoanById(Long id);

    LoanResponseDto getLoanByLoanNumber(String loanNumber);

    List<LoanResponseDto> getAllLoans();

    List<LoanResponseDto> getLoansByCustomer(Long customerId);

    List<LoanResponseDto> getLoansByStatus(LoanStatus status);

    List<LoanResponseDto> searchLoans(String keyword);

    LoanResponseDto closeLoan(Long id, String notes);

    LoanResponseDto recalculateLoanInterest(Long id, LocalDate asOfDate);

    DashboardStatsDto getDashboardStats();
}
