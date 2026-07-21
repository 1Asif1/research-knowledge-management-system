package com.clarivate.reviewservice.Controller;

import com.clarivate.reviewservice.Service.ResearcherService;
import com.clarivate.reviewservice.dto.Request.SubmitPaperRequest;
import com.clarivate.reviewservice.dto.Request.UploadVersionRequest;
import com.clarivate.reviewservice.dto.Response.PaperSubmissionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/researcher")
@RequiredArgsConstructor
public class ResearcherController {
    private final ResearcherService researcherService;

    @PostMapping("/papers")
    public ResponseEntity<PaperSubmissionResponse> submitPaper(@Valid @RequestBody SubmitPaperRequest request) {
        PaperSubmissionResponse response = researcherService.submitPaper(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/papers/{paperId}/versions")
    public ResponseEntity<PaperSubmissionResponse> uploadNewVersion(
            @PathVariable Long paperId,
            @Valid @RequestBody UploadVersionRequest request) {
        PaperSubmissionResponse response = researcherService.uploadNewVersion(paperId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{researcherId}/papers")
    public ResponseEntity<List<PaperSubmissionResponse>> getMySubmissions(@PathVariable Long researcherId) {
        List<PaperSubmissionResponse> responses = researcherService.getMySubmissions(researcherId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/papers/{paperId}")
    public ResponseEntity<PaperSubmissionResponse> getSubmission(@PathVariable Long paperId) {
        PaperSubmissionResponse response = researcherService.getSubmission(paperId);
        return ResponseEntity.ok(response);
    }
}
