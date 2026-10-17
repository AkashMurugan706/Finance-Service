package com.finance.smsfinance.service;

import com.finance.smsfinance.dto.PaymentRequestDto;
import com.finance.smsfinance.dto.PaymentResponseDto;

import java.util.List;

public interface PaymentService {

    PaymentResponseDto recordPayment(PaymentRequestDto request);

    PaymentResponseDto getPaymentById(Long id);

    PaymentResponseDto getPaymentByReceiptNumber(String receiptNumber);

    List<PaymentResponseDto> getPaymentsByLoan(Long loanId);

    List<PaymentResponseDto> getPaymentsByCustomer(Long customerId);

    List<PaymentResponseDto> getAllPayments();

    List<PaymentResponseDto> searchPayments(String query);
}
