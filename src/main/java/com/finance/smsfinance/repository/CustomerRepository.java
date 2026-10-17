package com.finance.smsfinance.repository;

import com.finance.smsfinance.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByPhoneNumber(String phoneNumber);

    Optional<Customer> findByCustomerCode(String customerCode);

    boolean existsByPhoneNumber(String phoneNumber);

    boolean existsByCustomerCode(String customerCode);

    List<Customer> findByActiveTrue();

    @Query("SELECT c FROM Customer c WHERE LOWER(c.fullName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR c.phoneNumber LIKE CONCAT('%', :query, '%') " +
           "OR LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Customer> searchCustomers(@Param("query") String query);
}
