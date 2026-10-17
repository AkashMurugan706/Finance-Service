package com.finance.smsfinance.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
@ConfigurationProperties(prefix = "app.finance")
public class AppBrandConfig {

    private String brandName = "SMS Finance Service";
    private String tagline = "Empowering Local Enterprise & Community Lending";
    private String currencySymbol = "₹";
    private String contactPhone = "+91 98400 12345";
    private String contactEmail = "support@smsfinance.com";
    private BigDecimal defaultVattiRatePerHundred = new BigDecimal("2.00");
    private int defaultGraceDays = 3;
    private BigDecimal dailyPenaltyPercentage = new BigDecimal("0.10");

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public String getCurrencySymbol() {
        return currencySymbol;
    }

    public void setCurrencySymbol(String currencySymbol) {
        this.currencySymbol = currencySymbol;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public BigDecimal getDefaultVattiRatePerHundred() {
        return defaultVattiRatePerHundred;
    }

    public void setDefaultVattiRatePerHundred(BigDecimal defaultVattiRatePerHundred) {
        this.defaultVattiRatePerHundred = defaultVattiRatePerHundred;
    }

    public int getDefaultGraceDays() {
        return defaultGraceDays;
    }

    public void setDefaultGraceDays(int defaultGraceDays) {
        this.defaultGraceDays = defaultGraceDays;
    }

    public BigDecimal getDailyPenaltyPercentage() {
        return dailyPenaltyPercentage;
    }

    public void setDailyPenaltyPercentage(BigDecimal dailyPenaltyPercentage) {
        this.dailyPenaltyPercentage = dailyPenaltyPercentage;
    }
}
