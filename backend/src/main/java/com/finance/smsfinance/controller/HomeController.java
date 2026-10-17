package com.finance.smsfinance.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Root endpoint handler providing a friendly welcome and status response
 * when visiting the backend root URL in a browser.
 */
@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "service", "SMS Finance Service REST API",
                "status", "UP",
                "healthCheck", "/api/health",
                "customersEndpoint", "/api/customers",
                "loansEndpoint", "/api/loans",
                "brandConfigEndpoint", "/api/brand-config",
                "timestamp", Instant.now().toString()
        ));
    }
}
