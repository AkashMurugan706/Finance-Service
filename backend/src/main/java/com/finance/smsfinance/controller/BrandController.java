package com.finance.smsfinance.controller;

import com.finance.smsfinance.config.AppBrandConfig;
import com.finance.smsfinance.dto.BrandInfoDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/brand")
public class BrandController {

    private final AppBrandConfig brandConfig;

    public BrandController(AppBrandConfig brandConfig) {
        this.brandConfig = brandConfig;
    }

    @GetMapping
    public ResponseEntity<BrandInfoDto> getBrandInfo() {
        BrandInfoDto info = new BrandInfoDto(
                brandConfig.getBrandName(),
                brandConfig.getTagline(),
                brandConfig.getCurrencySymbol(),
                brandConfig.getContactPhone(),
                brandConfig.getContactEmail(),
                brandConfig.getDefaultVattiRatePerHundred(),
                brandConfig.getDefaultGraceDays()
        );
        return ResponseEntity.ok(info);
    }
}
