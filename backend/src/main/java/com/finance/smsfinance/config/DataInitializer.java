package com.finance.smsfinance.config;

import com.finance.smsfinance.entity.CollateralDocument;
import com.finance.smsfinance.entity.Customer;
import com.finance.smsfinance.entity.Loan;
import com.finance.smsfinance.entity.PaymentRecord;
import com.finance.smsfinance.model.CollateralStatus;
import com.finance.smsfinance.model.InterestType;
import com.finance.smsfinance.model.LoanStatus;
import com.finance.smsfinance.model.PaymentType;
import com.finance.smsfinance.repository.CollateralRepository;
import com.finance.smsfinance.repository.CustomerRepository;
import com.finance.smsfinance.repository.LoanRepository;
import com.finance.smsfinance.repository.PaymentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Seeds initial demo data for SMS Finance Service upon startup.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final CustomerRepository customerRepository;
    private final LoanRepository loanRepository;
    private final CollateralRepository collateralRepository;
    private final PaymentRepository paymentRepository;

    public DataInitializer(CustomerRepository customerRepository,
                           LoanRepository loanRepository,
                           CollateralRepository collateralRepository,
                           PaymentRepository paymentRepository) {
        this.customerRepository = customerRepository;
        this.loanRepository = loanRepository;
        this.collateralRepository = collateralRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    public void run(String... args) {
        if (customerRepository.count() > 0) {
            return;
        }

        // 1. Seed Demo Customers
        Customer c1 = new Customer();
        c1.setCustomerCode("CUST-1001");
        c1.setFullName("K. Ramasamy");
        c1.setPhoneNumber("9841011223");
        c1.setEmail("ramasamy@example.com");
        c1.setAadhaarNumber("5432-8765-1234");
        c1.setAddress("42, Bazaar Street, Anna Nagar");
        c1.setCity("Chennai");
        c1.setOccupation("Retail Merchant");
        c1.setActive(true);
        c1 = customerRepository.save(c1);

        Customer c2 = new Customer();
        c2.setCustomerCode("CUST-1002");
        c2.setFullName("S. Meenakshi");
        c2.setPhoneNumber("9884022334");
        c2.setEmail("meenakshi.s@example.com");
        c2.setAadhaarNumber("8876-2341-9988");
        c2.setAddress("15, Gandhi Road, T. Nagar");
        c2.setCity("Chennai");
        c2.setOccupation("Textile Boutique Owner");
        c2.setActive(true);
        c2 = customerRepository.save(c2);

        Customer c3 = new Customer();
        c3.setCustomerCode("CUST-1003");
        c3.setFullName("V. Murugan");
        c3.setPhoneNumber("9791033445");
        c3.setAadhaarNumber("3321-4567-7890");
        c3.setAddress("8/2, North Car Street");
        c3.setCity("Madurai");
        c3.setOccupation("Transport Contractor");
        c3.setActive(true);
        c3 = customerRepository.save(c3);

        // 2. Seed Loans with Vatti Interest
        // Loan 1: ₹1,00,000 at ₹2.00 Vatti (2% / month)
        Loan l1 = new Loan();
        l1.setLoanNumber("LN-2026-1001");
        l1.setCustomer(c1);
        l1.setPrincipalAmount(new BigDecimal("100000.00"));
        l1.setRemainingPrincipal(new BigDecimal("90000.00"));
        l1.setInterestRate(new BigDecimal("2.00")); // ₹2 per 100/mo
        l1.setInterestType(InterestType.VATTI_PER_HUNDRED);
        l1.setStartDate(LocalDate.now().minusMonths(3));
        l1.setDueDate(LocalDate.now().plusMonths(9));
        l1.setTenureMonths(12);
        l1.setLoanStatus(LoanStatus.ACTIVE);
        l1.setTotalPrincipalPaid(new BigDecimal("10000.00"));
        l1.setTotalInterestPaid(new BigDecimal("4000.00"));
        l1.setLastInterestCalculatedDate(LocalDate.now().minusMonths(1));
        l1.setPurpose("Working capital expansion for grocery shop");
        l1.setNotes("Prompt payer; interest collected monthly");
        l1 = loanRepository.save(l1);

        // Loan 2: ₹50,000 at ₹2.50 Vatti
        Loan l2 = new Loan();
        l2.setLoanNumber("LN-2026-1002");
        l2.setCustomer(c2);
        l2.setPrincipalAmount(new BigDecimal("50000.00"));
        l2.setRemainingPrincipal(new BigDecimal("50000.00"));
        l2.setInterestRate(new BigDecimal("2.50"));
        l2.setInterestType(InterestType.VATTI_PER_HUNDRED);
        l2.setStartDate(LocalDate.now().minusMonths(1));
        l2.setDueDate(LocalDate.now().plusMonths(5));
        l2.setTenureMonths(6);
        l2.setLoanStatus(LoanStatus.ACTIVE);
        l2.setTotalPrincipalPaid(BigDecimal.ZERO);
        l2.setTotalInterestPaid(new BigDecimal("1250.00"));
        l2.setLastInterestCalculatedDate(LocalDate.now().minusDays(5));
        l2.setPurpose("Festival inventory purchase");
        l2 = loanRepository.save(l2);

        // 3. Seed Collateral Documents
        CollateralDocument doc1 = new CollateralDocument();
        doc1.setCustomer(c1);
        doc1.setLoan(l1);
        doc1.setDocumentType("PROPERTY_DEED");
        doc1.setDocumentNumber("DOC-CHE-2018-88412");
        doc1.setTitleOrDescription("Original registered sale deed for 1,200 sqft residential plot in Anna Nagar");
        doc1.setEstimatedValue(new BigDecimal("2500000.00"));
        doc1.setVaultStorageLocation("Vault-A / Locker-12");
        doc1.setStatus(CollateralStatus.PLEDGED);
        doc1.setPledgeDate(LocalDate.now().minusMonths(3));
        doc1.setVerifiedBy("Manager - SMS Finance");
        doc1.setNotes("Original title verified with sub-registrar encumbrance certificate");
        collateralRepository.save(doc1);

        CollateralDocument doc2 = new CollateralDocument();
        doc2.setCustomer(c2);
        doc2.setLoan(l2);
        doc2.setDocumentType("GOLD_VALUATION");
        doc2.setDocumentNumber("GLD-2026-0941");
        doc2.setTitleOrDescription("22K Gold Jewellery Appraisal Certificate (48 grams, 2 bangles, 1 chain)");
        doc2.setEstimatedValue(new BigDecimal("320000.00"));
        doc2.setVaultStorageLocation("Vault-Gold / Box-07");
        doc2.setStatus(CollateralStatus.PLEDGED);
        doc2.setPledgeDate(LocalDate.now().minusMonths(1));
        doc2.setVerifiedBy("Certified Goldsmith Appraiser");
        collateralRepository.save(doc2);

        // 4. Seed Payment Records
        PaymentRecord pay1 = new PaymentRecord();
        pay1.setReceiptNumber("REC-2026-10001");
        pay1.setLoan(l1);
        pay1.setCustomer(c1);
        pay1.setPaymentDate(LocalDate.now().minusMonths(2));
        pay1.setAmountPaid(new BigDecimal("2000.00"));
        pay1.setInterestPortion(new BigDecimal("2000.00"));
        pay1.setPrincipalPortion(BigDecimal.ZERO);
        pay1.setPenaltyPortion(BigDecimal.ZERO);
        pay1.setPrincipalBalanceAfter(new BigDecimal("100000.00"));
        pay1.setPaymentType(PaymentType.CASH);
        pay1.setNotes("Month 1 Vatti interest payment");
        pay1.setRecordedBy("Cashier");
        paymentRepository.save(pay1);

        PaymentRecord pay2 = new PaymentRecord();
        pay2.setReceiptNumber("REC-2026-10002");
        pay2.setLoan(l1);
        pay2.setCustomer(c1);
        pay2.setPaymentDate(LocalDate.now().minusMonths(1));
        pay2.setAmountPaid(new BigDecimal("12000.00"));
        pay2.setInterestPortion(new BigDecimal("2000.00"));
        pay2.setPrincipalPortion(new BigDecimal("10000.00"));
        pay2.setPenaltyPortion(BigDecimal.ZERO);
        pay2.setPrincipalBalanceAfter(new BigDecimal("90000.00"));
        pay2.setPaymentType(PaymentType.UPI);
        pay2.setTransactionReference("UPI-IND-884930129");
        pay2.setNotes("Month 2 interest + ₹10,000 principal reduction");
        pay2.setRecordedBy("Admin");
        paymentRepository.save(pay2);
    }
}
