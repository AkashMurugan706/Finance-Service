package com.finance.smsfinance.dto;

import java.time.LocalDateTime;

public class CustomerResponseDto {

    private Long id;
    private String customerCode;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String aadhaarNumber;
    private String panNumber;
    private String address;
    private String city;
    private String occupation;
    private Boolean active;
    private int totalLoansCount;
    private int activeLoansCount;
    private int collateralCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CustomerResponseDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCustomerCode() {
        return customerCode;
    }

    public void setCustomerCode(String customerCode) {
        this.customerCode = customerCode;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAadhaarNumber() {
        return aadhaarNumber;
    }

    public void setAadhaarNumber(String aadhaarNumber) {
        this.aadhaarNumber = aadhaarNumber;
    }

    public String getPanNumber() {
        return panNumber;
    }

    public void setPanNumber(String panNumber) {
        this.panNumber = panNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public int getTotalLoansCount() {
        return totalLoansCount;
    }

    public void setTotalLoansCount(int totalLoansCount) {
        this.totalLoansCount = totalLoansCount;
    }

    public int getActiveLoansCount() {
        return activeLoansCount;
    }

    public void setActiveLoansCount(int activeLoansCount) {
        this.activeLoansCount = activeLoansCount;
    }

    public int getCollateralCount() {
        return collateralCount;
    }

    public void setCollateralCount(int collateralCount) {
        this.collateralCount = collateralCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
