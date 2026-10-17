package com.finance.smsfinance.service.impl;

import com.finance.smsfinance.dto.CustomerRequestDto;
import com.finance.smsfinance.dto.CustomerResponseDto;
import com.finance.smsfinance.entity.Customer;
import com.finance.smsfinance.exception.DuplicateResourceException;
import com.finance.smsfinance.exception.ResourceNotFoundException;
import com.finance.smsfinance.model.LoanStatus;
import com.finance.smsfinance.repository.CustomerRepository;
import com.finance.smsfinance.service.CustomerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public CustomerResponseDto createCustomer(CustomerRequestDto request) {
        if (request.getPhoneNumber() != null && customerRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new DuplicateResourceException(
                    "Customer with phoneNumber number " + request.getPhoneNumber() + " already exists");
        }

        Customer customer = new Customer();
        customer.setCustomerCode(generateCustomerCode(request.getCustomerCode()));
        customer.setFullName(request.getFullName().trim());
        customer.setPhoneNumber(request.getPhoneNumber().trim());
        customer.setEmail(request.getEmail());
        customer.setAadhaarNumber(request.getAadhaarNumber());
        customer.setPanNumber(request.getPanNumber());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setOccupation(request.getOccupation());
        customer.setActive(request.getActive() != null ? request.getActive() : true);

        Customer saved = customerRepository.save(customer);
        return mapToDto(saved);
    }

    @Override
    public CustomerResponseDto updateCustomer(Long id, CustomerRequestDto request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(customer.getPhoneNumber())) {
            if (customerRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new DuplicateResourceException(
                        "phoneNumber number " + request.getPhoneNumber() + " is already in use by another customer");
            }
            customer.setPhoneNumber(request.getPhoneNumber().trim());
        }

        if (request.getFullName() != null) {
            customer.setFullName(request.getFullName().trim());
        }
        customer.setEmail(request.getEmail());
        customer.setAadhaarNumber(request.getAadhaarNumber());
        customer.setPanNumber(request.getPanNumber());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setOccupation(request.getOccupation());
        if (request.getActive() != null) {
            customer.setActive(request.getActive());
        }

        Customer updated = customerRepository.save(customer);
        return mapToDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponseDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return mapToDto(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponseDto getCustomerByCode(String customerCode) {
        Customer customer = customerRepository.findByCustomerCode(customerCode)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "customerCode", customerCode));
        return mapToDto(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponseDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponseDto> searchCustomers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllCustomers();
        }
        return customerRepository.searchCustomers(query.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        // Soft-delete customer by marking active=false
        customer.setActive(false);
        customerRepository.save(customer);
    }

    private String generateCustomerCode(String customCode) {
        if (customCode != null && !customCode.trim().isEmpty()) {
            String sanitized = customCode.trim().toUpperCase();
            if (customerRepository.existsByCustomerCode(sanitized)) {
                throw new DuplicateResourceException("Customer code '" + sanitized + "' already exists");
            }
            return sanitized;
        }
        long count = customerRepository.count() + 101;
        String generated = "CUST-" + count;
        while (customerRepository.existsByCustomerCode(generated)) {
            generated = "CUST-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }
        return generated;
    }

    private CustomerResponseDto mapToDto(Customer customer) {
        CustomerResponseDto dto = new CustomerResponseDto();
        dto.setId(customer.getId());
        dto.setCustomerCode(customer.getCustomerCode());
        dto.setFullName(customer.getFullName());
        dto.setPhoneNumber(customer.getPhoneNumber());
        dto.setEmail(customer.getEmail());
        dto.setAadhaarNumber(customer.getAadhaarNumber());
        dto.setPanNumber(customer.getPanNumber());
        dto.setAddress(customer.getAddress());
        dto.setCity(customer.getCity());
        dto.setOccupation(customer.getOccupation());
        dto.setActive(customer.getActive());
        dto.setCreatedAt(customer.getCreatedAt());
        dto.setUpdatedAt(customer.getUpdatedAt());

        if (customer.getLoans() != null) {
            dto.setTotalLoansCount(customer.getLoans().size());
            long activeCount = customer.getLoans().stream()
                    .filter(l -> l.getLoanStatus() == LoanStatus.ACTIVE)
                    .count();
            dto.setActiveLoansCount((int) activeCount);
        } else {
            dto.setTotalLoansCount(0);
            dto.setActiveLoansCount(0);
        }

        if (customer.getCollateralDocuments() != null) {
            dto.setCollateralCount(customer.getCollateralDocuments().size());
        } else {
            dto.setCollateralCount(0);
        }

        return dto;
    }
}
