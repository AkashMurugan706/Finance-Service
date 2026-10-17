# SMS Finance Service - Backend Architecture

A robust, enterprise-grade Spring Boot 3 (Java 17) backend for **SMS Finance Service**, featuring community lending workflows, collateral vault management, and high-precision `BigDecimal` Vatti interest calculations.

---

## 🛠️ Technology Stack
- **Framework:** Spring Boot 3.3.4 (Java 17)
- **Data Persistence:** Spring Data JPA / Hibernate 6
- **Database:** PostgreSQL (`jdbc:postgresql://localhost:5432/smsfinancedb`) [H2 available for unit tests]
- **API Spec & Error Standards:** RFC 7807 Problem Details (`application/problem+json`)
- **Build Tool:** Apache Maven 3.9.6 (with bundled self-contained Maven Wrapper `mvnw` & `mvnw.cmd`)

---

## 📦 Package Structure (`com.finance.smsfinance`)

```
backend/
├── pom.xml
├── mvnw & mvnw.cmd
├── src/
│   ├── main/
│   │   ├── java/com/finance/smsfinance/
│   │   │   ├── SmsFinanceServiceApplication.java
│   │   │   ├── config/
│   │   │   │   ├── AppBrandConfig.java       # Dynamic 'SMS Finance Service' branding & config
│   │   │   │   ├── DataInitializer.java      # Pre-seeds demo customers, loans, collaterals & payments
│   │   │   │   └── WebConfig.java            # CORS configuration
│   │   │   ├── entity/
│   │   │   │   ├── Customer.java             # Customer entity with KYC, contact & credit info
│   │   │   │   ├── Loan.java                 # Loan entity with principal, rate, interest type & tenure
│   │   │   │   ├── CollateralDocument.java   # Deeds, gold valuations, RC books & vault tracking
│   │   │   │   └── PaymentRecord.java        # Receipts, principal/interest allocation & balances
│   │   │   ├── model/
│   │   │   │   ├── LoanStatus.java           # PENDING_APPROVAL, ACTIVE, CLOSED, DEFAULTED, CANCELLED
│   │   │   │   ├── CollateralStatus.java     # PENDING_VERIFICATION, VERIFIED, PLEDGED, RETURNED, LIQUIDATED
│   │   │   │   ├── InterestType.java         # VATTI_PER_HUNDRED, SIMPLE_MONTHLY, COMPOUND_MONTHLY, FLAT_ANNUAL
│   │   │   │   └── PaymentType.java          # CASH, UPI, BANK_TRANSFER, CHEQUE
│   │   │   ├── repository/
│   │   │   │   ├── CustomerRepository.java   # Customer queries and text search
│   │   │   │   ├── LoanRepository.java       # Aggregations, active principal sums & search
│   │   │   │   ├── CollateralRepository.java # Vault storage & status queries
│   │   │   │   └── PaymentRepository.java    # Revenue totals & receipt queries
│   │   │   ├── dto/
│   │   │   │   ├── CustomerRequestDto.java / CustomerResponseDto.java
│   │   │   │   ├── LoanRequestDto.java / LoanResponseDto.java
│   │   │   │   ├── PaymentRequestDto.java / PaymentResponseDto.java
│   │   │   │   ├── CollateralRequestDto.java / CollateralResponseDto.java
│   │   │   │   ├── InterestCalculationRequestDto.java / InterestCalculationResponseDto.java
│   │   │   │   ├── DashboardStatsDto.java
│   │   │   │   └── BrandInfoDto.java
│   │   │   ├── service/
│   │   │   │   ├── CustomerService.java & impl/CustomerServiceImpl.java
│   │   │   │   ├── LoanService.java & impl/LoanServiceImpl.java
│   │   │   │   ├── PaymentService.java & impl/PaymentServiceImpl.java
│   │   │   │   ├── CollateralService.java & impl/CollateralServiceImpl.java
│   │   │   │   └── VattiCalculationService.java & impl/VattiCalculationServiceImpl.java
│   │   │   ├── controller/
│   │   │   │   ├── CustomerController.java   # /api/customers
│   │   │   │   ├── LoanController.java       # /api/loans
│   │   │   │   ├── PaymentController.java    # /api/payments
│   │   │   │   ├── CollateralController.java # /api/collateral
│   │   │   │   └── BrandController.java      # /api/brand
│   │   │   └── exception/
│   │   │       ├── GlobalExceptionHandler.java # RFC 7807 ProblemDetail handler
│   │   │       ├── ResourceNotFoundException.java
│   │   │       ├── BusinessException.java
│   │   │       ├── InvalidPaymentException.java
│   │   │       └── DuplicateResourceException.java
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       └── java/com/finance/smsfinance/service/
│           └── VattiCalculationServiceTest.java
```

---

## 💡 Vatti Interest Engine (`BigDecimal`)

In traditional Indian community lending:
- Interest is expressed as **"₹X per ₹100 per month"** (e.g., ₹2.00 Vatti on ₹1,00,000 = ₹2,000 / month; equivalent to 24% p.a.).
- When calculating between two dates:
  $$\text{Full Months} = \frac{\text{Days}}{30}$$
  $$\text{Remaining Days} = \text{Days} \pmod{30}$$
  $$\text{Accrued Interest} = (\text{Monthly Interest} \times \text{Full Months}) + \left(\frac{\text{Monthly Interest}}{30} \times \text{Remaining Days}\right)$$
- When payments are received with `autoAllocate: true`, accrued interest up to the payment date is prioritized, and the remainder reduces the outstanding principal balance. Once remaining principal reaches 0, the loan status is automatically transitioned to `CLOSED`.

---

## 🚀 Running the Application

### With Maven Wrapper:
```bash
cd backend
.\mvnw.cmd spring-boot:run
```

### Running Tests:
```bash
cd backend
.\mvnw.cmd test
```

### Accessing H2 Database Console:
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:smsfinancedb`
- Username: `sa`
- Password: *(empty)*

---

## 🌐 Key REST API Endpoints

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Brand** | `GET` | `/api/brand` | Returns dynamic brand info ('SMS Finance Service') |
| **Customers** | `POST` | `/api/customers` | Register customer |
| | `GET` | `/api/customers` | List all / search customers |
| | `GET` | `/api/customers/{id}` | Get customer profile & loan counts |
| | `PUT` | `/api/customers/{id}` | Update customer details |
| | `DELETE` | `/api/customers/{id}` | Soft-deactivate customer |
| **Loans** | `POST` | `/api/loans` | Disburse new loan |
| | `GET` | `/api/loans` | List loans with status/customer filters |
| | `GET` | `/api/loans/{id}` | Loan details with accrued interest |
| | `POST` | `/api/loans/{id}/close` | Settle & close loan |
| | `POST` | `/api/loans/{id}/recalculate` | As-of-date interest recalculation |
| | `GET` | `/api/loans/dashboard/stats` | Executive KPI & revenue metrics |
| | `POST` | `/api/loans/calculate-interest` | Standalone Vatti interest calculator |
| **Payments** | `POST` | `/api/payments` | Record payment with auto or manual allocation |
| | `GET` | `/api/payments` | Payment ledger history |
| | `GET` | `/api/payments/loan/{loanId}` | Ledger for a specific loan |
| **Collateral**| `POST` | `/api/collateral` | Pledge asset / document in vault |
| | `GET` | `/api/collateral` | View collateral inventory |
| | `POST` | `/api/collateral/{id}/return` | Mark collateral returned to customer |
