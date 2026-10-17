package com.finance.smsfinance.repository;

import com.finance.smsfinance.entity.CollateralDocument;
import com.finance.smsfinance.model.CollateralStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CollateralRepository extends JpaRepository<CollateralDocument, Long> {

    List<CollateralDocument> findByCustomerIdOrderByPledgeDateDesc(Long customerId);

    List<CollateralDocument> findByLoanId(Long loanId);

    List<CollateralDocument> findByStatus(CollateralStatus status);

    @Query("SELECT COALESCE(SUM(c.estimatedValue), 0) FROM CollateralDocument c WHERE c.status = 'PLEDGED'")
    BigDecimal sumPledgedCollateralValue();

    @Query("SELECT c FROM CollateralDocument c WHERE LOWER(c.documentNumber) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.titleOrDescription) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.customer.fullName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<CollateralDocument> searchCollateral(@Param("query") String query);
}
