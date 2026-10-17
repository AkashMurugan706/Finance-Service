package com.finance.smsfinance.dto;

import java.math.BigDecimal;

public class BrandInfoDto {

    private String brandName;
    private String tagline;
    private String currencySymbol;
    private String contactPhone;
    private String contactEmail;
    private BigDecimal defaultVattiRatePerHundred;
    private int defaultGraceDays;

    public BrandInfoDto() {
    }

    public BrandInfoDto(String brandName, String tagline, String currencySymbol, String contactPhone,
                        String contactEmail, BigDecimal defaultVattiRatePerHundred, int defaultGraceDays) {
        this.brandName = brandName;
        this.tagline = tagline;
        this.currencySymbol = currencySymbol;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.defaultVattiRatePerHundred = defaultVattiRatePerHundred;
        this.defaultGraceDays = defaultGraceDays;
    }

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
}
