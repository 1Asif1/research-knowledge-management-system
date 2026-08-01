package com.clarivate.paperservice.Controller;

import com.clarivate.paperservice.Dto.Request.ResearcherSubmitPaperRequest;
import com.clarivate.paperservice.Dto.Request.ResearcherUploadVersionRequest;
import com.clarivate.paperservice.Dto.Response.PaperDownloadResponse;
import com.clarivate.paperservice.Dto.Response.ReviewCommentResponse;
import com.clarivate.paperservice.Dto.Response.ResearcherPaperResponse;
import com.clarivate.paperservice.Service.Interface.PaperService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/researcher")
@RequiredArgsConstructor
public class ResearcherPaperController {

    private final PaperService paperService;

    @PostMapping(value = "/papers", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResearcherPaperResponse> submitPaper(
            @RequestParam String title,
            @RequestParam String abstractText,
            @RequestParam Long researcherId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paperService.submitResearcherPaper(title, abstractText, researcherId, file));
    }

    @PostMapping(value = "/papers", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ResearcherPaperResponse> submitPaperCompatibility(
            @Valid @RequestBody ResearcherSubmitPaperRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paperService.submitResearcherPaper(request));
    }

    @PutMapping(value = "/papers/{paperId}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResearcherPaperResponse> uploadVersion(
            @PathVariable Long paperId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String changeSummary) {
        return ResponseEntity.ok(paperService.uploadResearcherVersion(paperId, file, changeSummary));
    }

    @PutMapping(value = "/papers/{paperId}/versions", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ResearcherPaperResponse> uploadVersionCompatibility(
            @PathVariable Long paperId,
            @Valid @RequestBody ResearcherUploadVersionRequest request) {
        return ResponseEntity.ok(paperService.uploadResearcherVersion(paperId, request));
    }

    @GetMapping("/{researcherId}/papers")
    public ResponseEntity<List<ResearcherPaperResponse>> getMySubmissions(@PathVariable Long researcherId) {
        return ResponseEntity.ok(paperService.getMySubmissions(researcherId));
    }

    @GetMapping("/papers/{paperId}")
    public ResponseEntity<ResearcherPaperResponse> getSubmission(@PathVariable Long paperId) {
        return ResponseEntity.ok(paperService.getResearcherSubmission(paperId));
    }

    @GetMapping("/papers/{paperId}/comments")
    public ResponseEntity<List<ReviewCommentResponse>> getReviewComments(@PathVariable Long paperId) {
        return ResponseEntity.ok(paperService.getResearcherReviewComments(paperId));
    }

    @GetMapping(value = "/papers/{paperId}/download", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadCurrentPaperVersion(@PathVariable Long paperId) {
        PaperDownloadResponse response = paperService.downloadCurrentPaperVersion(paperId);
        String fileName = response.getFileName().toLowerCase().endsWith(".pdf")
                ? response.getFileName()
                : response.getFileName() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(fileName).build().toString())
                .contentType(MediaType.APPLICATION_PDF)
                .body(response.getContent());
    }
}
