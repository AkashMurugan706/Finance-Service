package com.finance.smsfinance.service.impl;

import com.finance.smsfinance.dto.CollateralRequestDto;
import com.finance.smsfinance.dto.CollateralResponseDto;
import com.finance.smsfinance.entity.CollateralDocument;
import com.finance.smsfinance.entity.Customer;
import com.finance.smsfinance.entity.Loan;
import com.finance.smsfinance.exception.ResourceNotFoundException;
import com.finance.smsfinance.model.CollateralStatus;
import com.finance.smsfinance.repository.CollateralRepository;
import com.finance.smsfinance.repository.CustomerRepository;
import com.finance.smsfinance.repository.LoanRepository;
import com.finance.smsfinance.service.CollateralService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CollateralServiceImpl implements CollateralService {

    private final CollateralRepository collateralRepository;
    private final CustomerRepository customerRepository;
    private final LoanRepository loanRepository;

    public CollateralServiceImpl(CollateralRepository collateralRepository,
                                 CustomerRepository customerRepository,
                                 LoanRepository loanRepository) {
        this.collateralRepository = collateralRepository;
        this.customerRepository = customerRepository;
        this.loanRepository = loanRepository;
    }

    @Override
    public CollateralResponseDto addCollateral(CollateralRequestDto request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        Loan loan = null;
        if (request.getLoanId() != null) {
            loan = loanRepository.findById(request.getLoanId())
                    .orElseThrow(() -> new ResourceNotFoundException("Loan", "id", request.getLoanId()));
        }

        CollateralDocument doc = new CollateralDocument();
        doc.setCustomer(customer);
        doc.setLoan(loan);
        doc.setDocumentType(request.getDocumentType());
        doc.setDocumentNumber(request.getDocumentNumber());
        doc.setTitleOrDescription(request.getTitleOrDescription());
        doc.setEstimatedValue(request.getEstimatedValue());
        doc.setVaultStorageLocation(request.getVaultStorageLocation());
        doc.setStatus(request.getStatus() != null ? request.getStatus() : CollateralStatus.PLEDGED);
        doc.setDocumentFileUrl(request.getDocumentFileUrl());
        doc.setPledgeDate(request.getPledgeDate() != null ? request.getPledgeDate() : LocalDate.now());
        doc.setReturnDate(request.getReturnDate());
        doc.setVerifiedBy(request.getVerifiedBy());
        doc.setNotes(request.getNotes());

        CollateralDocument saved = collateralRepository.save(doc);
        return mapToDto(saved);
    }

    @Override
    public CollateralResponseDto updateCollateral(Long id, CollateralRequestDto request) {
        CollateralDocument doc = collateralRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CollateralDocument", "id", id));

        if (request.getLoanId() != null) {
            Loan loan = loanRepository.findById(request.getLoanId())
                    .orElseThrow(() -> new ResourceNotFoundException("Loan", "id", request.getLoanId()));
            doc.setLoan(loan);
        }

        if (request.getDocumentType() != null) {
            doc.setDocumentType(request.getDocumentType());
        }
        if (request.getDocumentNumber() != null) {
            doc.setDocumentNumber(request.getDocumentNumber());
        }
        if (request.getTitleOrDescription() != null) {
            doc.setTitleOrDescription(request.getTitleOrDescription());
        }
        if (request.getEstimatedValue() != null) {
            doc.setEstimatedValue(request.getEstimatedValue());
        }
        if (request.getVaultStorageLocation() != null) {
            doc.setVaultStorageLocation(request.getVaultStorageLocation());
        }
        if (request.getStatus() != null) {
            doc.setStatus(request.getStatus());
        }
        if (request.getDocumentFileUrl() != null) {
            doc.setDocumentFileUrl(request.getDocumentFileUrl());
        }
        if (request.getReturnDate() != null) {
            doc.setReturnDate(request.getReturnDate());
        }
        if (request.getVerifiedBy() != null) {
            doc.setVerifiedBy(request.getVerifiedBy());
        }
        if (request.getNotes() != null) {
            doc.setNotes(request.getNotes());
        }

        CollateralDocument updated = collateralRepository.save(doc);
        return mapToDto(updated);
    }

    @Override
    public CollateralResponseDto returnCollateral(Long id, LocalDate returnDate, String notes) {
        CollateralDocument doc = collateralRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CollateralDocument", "id", id));

        doc.setStatus(CollateralStatus.RETURNED);
        doc.setReturnDate(returnDate != null ? returnDate : LocalDate.now());
        if (notes != null && !notes.trim().isEmpty()) {
            String updatedNotes = (doc.getNotes() != null ? doc.getNotes() + " | " : "") + "Return note: " + notes;
            doc.setNotes(updatedNotes);
        }

        CollateralDocument saved = collateralRepository.save(doc);
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CollateralResponseDto getCollateralById(Long id) {
        CollateralDocument doc = collateralRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CollateralDocument", "id", id));
        return mapToDto(doc);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CollateralResponseDto> getCollateralsByCustomer(Long customerId) {
        return collateralRepository.findByCustomerIdOrderByPledgeDateDesc(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CollateralResponseDto> getCollateralsByLoan(Long loanId) {
        return collateralRepository.findByLoanId(loanId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CollateralResponseDto> getAllCollaterals() {
        return collateralRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CollateralResponseDto> getCollateralsByStatus(CollateralStatus status) {
        return collateralRepository.findByStatus(status).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CollateralResponseDto> searchCollateral(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllCollaterals();
        }
        return collateralRepository.searchCollateral(query.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private CollateralResponseDto mapToDto(CollateralDocument doc) {
        CollateralResponseDto dto = new CollateralResponseDto();
        dto.setId(doc.getId());
        dto.setCustomerId(doc.getCustomer().getId());
        dto.setCustomerCode(doc.getCustomer().getCustomerCode());
        dto.setCustomerName(doc.getCustomer().getFullName());

        if (doc.getLoan() != null) {
            dto.setLoanId(doc.getLoan().getId());
            dto.setLoanNumber(doc.getLoan().getLoanNumber());
        }

        dto.setDocumentType(doc.getDocumentType());
        dto.setDocumentNumber(doc.getDocumentNumber());
        dto.setTitleOrDescription(doc.getTitleOrDescription());
        dto.setEstimatedValue(doc.getEstimatedValue());
        dto.setVaultStorageLocation(doc.getVaultStorageLocation());
        dto.setStatus(doc.getStatus());
        dto.setStatusDisplayName(doc.getStatus().getDisplayName());
        dto.setDocumentFileUrl(doc.getDocumentFileUrl());
        dto.setPledgeDate(doc.getPledgeDate());
        dto.setReturnDate(doc.getReturnDate());
        dto.setVerifiedBy(doc.getVerifiedBy());
        dto.setNotes(doc.getNotes());
        dto.setCreatedAt(doc.getCreatedAt());
        dto.setUpdatedAt(doc.getUpdatedAt());

        return dto;
    }
}
