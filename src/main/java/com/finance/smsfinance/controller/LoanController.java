package com.finance.smsfinance.controller;

import com.finance.smsfinance.dto.DashboardStatsDto;
import com.finance.smsfinance.dto.InterestCalculationRequestDto;
import com.finance.smsfinance.dto.InterestCalculationResponseDto;
import com.finance.smsfinance.dto.LoanRequestDto;
import com.finance.smsfinance.dto.LoanResponseDto;
import com.finance.smsfinance.model.LoanStatus;
import com.finance.smsfinance.service.LoanService;
import com.finance.smsfinance.service.VattiCalculationService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;
    private final VattiCalculationService vattiCalculationService;

    public LoanController(LoanService loanService, VattiCalculationService vattiCalculationService) {
        this.loanService = loanService;
        this.vattiCalculationService = vattiCalculationService;
    }

    @PostMapping
    public ResponseEntity<LoanResponseDto> createLoan(@Valid @RequestBody LoanRequestDto request) {
        LoanResponseDto response = loanService.createLoan(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<LoanResponseDto>> getLoans(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "status", required = false) LoanStatus status,
            @RequestParam(name = "customerId", required = false) Long customerId) {

        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(loanService.searchLoans(search));
        }
        if (status != null) {
            return ResponseEntity.ok(loanService.getLoansByStatus(status));
        }
        if (customerId != null) {
            return ResponseEntity.ok(loanService.getLoansByCustomer(customerId));
        }
        return ResponseEntity.ok(loanService.getAllLoans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanResponseDto> getLoanById(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.getLoanById(id));
    }

    @GetMapping("/number/{loanNumber}")
    public ResponseEntity<LoanResponseDto> getLoanByNumber(@PathVariable String loanNumber) {
        return ResponseEntity.ok(loanService.getLoanByLoanNumber(loanNumber));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LoanResponseDto> updateLoan(
            @PathVariable Long id,
            @Valid @RequestBody LoanRequestDto request) {
        return ResponseEntity.ok(loanService.updateLoan(id, request));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<LoanResponseDto> closeLoan(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = (body != null) ? body.get("notes") : null;
        return ResponseEntity.ok(loanService.closeLoan(id, notes));
    }

    @PostMapping("/{id}/recalculate")
    public ResponseEntity<LoanResponseDto> recalculateLoanInterest(
            @PathVariable Long id,
            @RequestParam(name = "asOfDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        return ResponseEntity.ok(loanService.recalculateLoanInterest(id, asOfDate));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(loanService.getDashboardStats());
    }

    @PostMapping("/calculate-interest")
    public ResponseEntity<InterestCalculationResponseDto> calculateInterest(
            @Valid @RequestBody InterestCalculationRequestDto request) {
        return ResponseEntity.ok(vattiCalculationService.calculateBreakdown(request));
    }
}
