package com.finance.smsfinance.controller;

import com.finance.smsfinance.dto.PaymentRequestDto;
import com.finance.smsfinance.dto.PaymentResponseDto;
import com.finance.smsfinance.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<PaymentResponseDto> recordPayment(@Valid @RequestBody PaymentRequestDto request) {
        PaymentResponseDto response = paymentService.recordPayment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponseDto>> getAllPayments(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "loanId", required = false) Long loanId,
            @RequestParam(name = "customerId", required = false) Long customerId) {

        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(paymentService.searchPayments(search));
        }
        if (loanId != null) {
            return ResponseEntity.ok(paymentService.getPaymentsByLoan(loanId));
        }
        if (customerId != null) {
            return ResponseEntity.ok(paymentService.getPaymentsByCustomer(customerId));
        }
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDto> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/receipt/{receiptNumber}")
    public ResponseEntity<PaymentResponseDto> getPaymentByReceiptNumber(@PathVariable String receiptNumber) {
        return ResponseEntity.ok(paymentService.getPaymentByReceiptNumber(receiptNumber));
    }

    @GetMapping("/loan/{loanId}")
    public ResponseEntity<List<PaymentResponseDto>> getPaymentsByLoan(@PathVariable Long loanId) {
        return ResponseEntity.ok(paymentService.getPaymentsByLoan(loanId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<PaymentResponseDto>> getPaymentsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(paymentService.getPaymentsByCustomer(customerId));
    }
}
