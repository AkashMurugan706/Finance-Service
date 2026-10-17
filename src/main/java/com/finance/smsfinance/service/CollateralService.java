package com.finance.smsfinance.service;

import com.finance.smsfinance.dto.CollateralRequestDto;
import com.finance.smsfinance.dto.CollateralResponseDto;
import com.finance.smsfinance.model.CollateralStatus;

import java.time.LocalDate;
import java.util.List;

public interface CollateralService {

    CollateralResponseDto addCollateral(CollateralRequestDto request);

    CollateralResponseDto updateCollateral(Long id, CollateralRequestDto request);

    CollateralResponseDto returnCollateral(Long id, LocalDate returnDate, String notes);

    CollateralResponseDto getCollateralById(Long id);

    List<CollateralResponseDto> getCollateralsByCustomer(Long customerId);

    List<CollateralResponseDto> getCollateralsByLoan(Long loanId);

    List<CollateralResponseDto> getAllCollaterals();

    List<CollateralResponseDto> getCollateralsByStatus(CollateralStatus status);

    List<CollateralResponseDto> searchCollateral(String query);
}
