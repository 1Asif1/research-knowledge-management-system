package com.clarivate.reportservice.controller;

import com.clarivate.reportservice.dto.AnnualReportSummaryResponse;
import com.clarivate.reportservice.dto.PublicationReportRequest;
import com.clarivate.reportservice.dto.ReportResponse;
import com.clarivate.reportservice.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/publication")
    public ResponseEntity<ReportResponse> createPublicationReport(@Valid @RequestBody PublicationReportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.createPublicationReport(request));
    }

    @GetMapping
    public ResponseEntity<List<ReportResponse>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @GetMapping("/annual")
    public ResponseEntity<AnnualReportSummaryResponse> getAnnualSummary(@RequestParam int year) {
        return ResponseEntity.ok(reportService.getAnnualSummary(year));
    }
}
