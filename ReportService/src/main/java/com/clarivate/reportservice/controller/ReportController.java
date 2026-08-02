package com.clarivate.reportservice.controller;

import com.clarivate.reportservice.dto.AnnualReportSummaryResponse;
import com.clarivate.reportservice.dto.PublicationReportRequest;
import com.clarivate.reportservice.dto.PublishedPaperReportResponse;
import com.clarivate.reportservice.dto.PublishedPaperSummaryResponse;
import com.clarivate.reportservice.dto.ReportResponse;
import com.clarivate.reportservice.service.PublishedPaperReportService;
import com.clarivate.reportservice.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.clarivate.reportservice.dto.EditorReportSummaryResponse;
import com.clarivate.reportservice.service.EditorReportService;

@RestController
@RequestMapping("/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final EditorReportService editorReportService;
    private final PublishedPaperReportService publishedPaperReportService;

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

    @GetMapping("/editor/{editorId}")
    public ResponseEntity<EditorReportSummaryResponse> getEditorSummary(@PathVariable Long editorId) {
        return ResponseEntity.ok(editorReportService.getEditorSummary(editorId));
    }

    @GetMapping("/published-papers")
    public ResponseEntity<List<PublishedPaperSummaryResponse>> getPublishedPapers() {
        return ResponseEntity.ok(publishedPaperReportService.getPublishedPapers());
    }

    @GetMapping("/published-paper/{paperId}")
    public ResponseEntity<PublishedPaperReportResponse> getPublishedPaperReport(@PathVariable Long paperId) {
        return ResponseEntity.ok(publishedPaperReportService.getPublishedPaperReport(paperId));
    }

    @GetMapping(value = "/published-paper/{paperId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadPublishedPaperPdf(@PathVariable Long paperId) {
        byte[] pdfBytes = publishedPaperReportService.generatePublishedPaperPdf(paperId);
        String fileName = "Published_Paper_Report_" + paperId + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(fileName).build().toString())
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
