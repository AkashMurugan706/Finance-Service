package com.finance.smsfinance.controller;

import com.finance.smsfinance.dto.CollateralRequestDto;
import com.finance.smsfinance.dto.CollateralResponseDto;
import com.finance.smsfinance.model.CollateralStatus;
import com.finance.smsfinance.service.CollateralService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/collateral")
public class CollateralController {

    private final CollateralService collateralService;

    public CollateralController(CollateralService collateralService) {
        this.collateralService = collateralService;
    }

    @PostMapping
    public ResponseEntity<CollateralResponseDto> addCollateral(@Valid @RequestBody CollateralRequestDto request) {
        CollateralResponseDto response = collateralService.addCollateral(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }
        try {
            Path uploadDir = Paths.get("uploads", "collateral");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String storedFilename = "DOC_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12) + extension;
            Path targetPath = uploadDir.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/collateral/" + storedFilename;
            return ResponseEntity.ok(Map.of(
                    "fileUrl", fileUrl,
                    "fileName", originalFilename != null ? originalFilename : storedFilename,
                    "fileSize", file.getSize(),
                    "contentType", file.getContentType() != null ? file.getContentType() : "application/octet-stream"
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to store file: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<CollateralResponseDto>> getAllCollateral(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "status", required = false) CollateralStatus status,
            @RequestParam(name = "customerId", required = false) Long customerId,
            @RequestParam(name = "loanId", required = false) Long loanId) {

        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(collateralService.searchCollateral(search));
        }
        if (status != null) {
            return ResponseEntity.ok(collateralService.getCollateralsByStatus(status));
        }
        if (customerId != null) {
            return ResponseEntity.ok(collateralService.getCollateralsByCustomer(customerId));
        }
        if (loanId != null) {
            return ResponseEntity.ok(collateralService.getCollateralsByLoan(loanId));
        }
        return ResponseEntity.ok(collateralService.getAllCollaterals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CollateralResponseDto> getCollateralById(@PathVariable Long id) {
        return ResponseEntity.ok(collateralService.getCollateralById(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<CollateralResponseDto>> getCollateralByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(collateralService.getCollateralsByCustomer(customerId));
    }

    @GetMapping("/loan/{loanId}")
    public ResponseEntity<List<CollateralResponseDto>> getCollateralByLoan(@PathVariable Long loanId) {
        return ResponseEntity.ok(collateralService.getCollateralsByLoan(loanId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CollateralResponseDto> updateCollateral(
            @PathVariable Long id,
            @Valid @RequestBody CollateralRequestDto request) {
        return ResponseEntity.ok(collateralService.updateCollateral(id, request));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<CollateralResponseDto> returnCollateral(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {
        LocalDate returnDate = LocalDate.now();
        String notes = null;

        if (body != null) {
            if (body.containsKey("returnDate") && body.get("returnDate") != null) {
                returnDate = LocalDate.parse(body.get("returnDate").toString());
            }
            if (body.containsKey("notes") && body.get("notes") != null) {
                notes = body.get("notes").toString();
            }
        }
        return ResponseEntity.ok(collateralService.returnCollateral(id, returnDate, notes));
    }
}
