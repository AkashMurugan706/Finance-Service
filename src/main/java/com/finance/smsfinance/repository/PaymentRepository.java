package com.finance.smsfinance.repository;

import com.finance.smsfinance.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentRecord, Long> {

    Optional<PaymentRecord> findByReceiptNumber(String receiptNumber);

    List<PaymentRecord> findByLoanIdOrderByPaymentDateDesc(Long loanId);

    List<PaymentRecord> findByCustomerIdOrderByPaymentDateDesc(Long customerId);

    List<PaymentRecord> findByPaymentDateBetweenOrderByPaymentDateDesc(LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM PaymentRecord p")
    BigDecimal sumTotalCollections();

    @Query("SELECT COALESCE(SUM(p.interestPortion), 0) FROM PaymentRecord p")
    BigDecimal sumTotalInterestCollected();

    @Query("SELECT COALESCE(SUM(p.principalPortion), 0) FROM PaymentRecord p")
    BigDecimal sumTotalPrincipalCollected();

    @Query("SELECT p FROM PaymentRecord p WHERE LOWER(p.receiptNumber) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.customer.fullName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.loan.loanNumber) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<PaymentRecord> searchPayments(@Param("query") String query);
}
