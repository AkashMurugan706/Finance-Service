package com.finance.smsfinance.service;

import com.finance.smsfinance.dto.CustomerRequestDto;
import com.finance.smsfinance.dto.CustomerResponseDto;

import java.util.List;

public interface CustomerService {

    CustomerResponseDto createCustomer(CustomerRequestDto request);

    CustomerResponseDto updateCustomer(Long id, CustomerRequestDto request);

    CustomerResponseDto getCustomerById(Long id);

    CustomerResponseDto getCustomerByCode(String customerCode);

    List<CustomerResponseDto> getAllCustomers();

    List<CustomerResponseDto> searchCustomers(String query);

    void deleteCustomer(Long id);
}
