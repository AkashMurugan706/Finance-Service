package com.finance.smsfinance.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Health check endpoint for cloud platforms (Render, Railway, AWS, K8s).
 * Used by container orchestrators to verify service liveness.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "SMS Finance Service Backend",
                "timestamp", Instant.now().toString(),
                "version", "1.0.0"
        ));
    }
}
