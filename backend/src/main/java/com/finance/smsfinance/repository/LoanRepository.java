package com.finance.smsfinance.repository;

import com.finance.smsfinance.entity.Loan;
import com.finance.smsfinance.model.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    Optional<Loan> findByLoanNumber(String loanNumber);

    boolean existsByLoanNumber(String loanNumber);

    List<Loan> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Loan> findByLoanStatus(LoanStatus loanStatus);

    long countByLoanStatus(LoanStatus loanStatus);

    @Query("SELECT COALESCE(SUM(l.principalAmount), 0) FROM Loan l WHERE l.loanStatus = 'ACTIVE'")
    BigDecimal sumActivePrincipalAmount();

    @Query("SELECT COALESCE(SUM(l.remainingPrincipal), 0) FROM Loan l WHERE l.loanStatus = 'ACTIVE'")
    BigDecimal sumActiveRemainingPrincipal();

    @Query("SELECT l FROM Loan l WHERE LOWER(l.loanNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(l.customer.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR l.customer.phoneNumber LIKE CONCAT('%', :keyword, '%')")
    List<Loan> searchLoans(@Param("keyword") String keyword);
}
