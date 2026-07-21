package com.clarivate.reviewservice.Controller;

import com.clarivate.reviewservice.Service.EditorService;
import com.clarivate.reviewservice.dto.Request.AssignReviewerRequest;
import com.clarivate.reviewservice.dto.Request.EditorDecisionRequest;
import com.clarivate.reviewservice.dto.Response.ReviewProcessResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/editor")
@RequiredArgsConstructor
public class EditorController {
    private final EditorService editorService;

    @GetMapping("/reviews/pending")
    public ResponseEntity<List<ReviewProcessResponse>> getPendingReviews() {
        List<ReviewProcessResponse> responses = editorService.getPendingReviews();
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/assign-reviewer")
    public ResponseEntity<ReviewProcessResponse> assignReviewer(@Valid @RequestBody AssignReviewerRequest request) {
        ReviewProcessResponse response = editorService.assignReviewer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/reviews/{reviewId}/decision")
    public ResponseEntity<ReviewProcessResponse> makeFinalDecision(
            @PathVariable Long reviewId,
            @Valid @RequestBody EditorDecisionRequest request) {
        ReviewProcessResponse response = editorService.makeFinalDecision(reviewId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{editorId}/reviews")
    public ResponseEntity<List<ReviewProcessResponse>> getAssignedReviews(@PathVariable Long editorId) {
        List<ReviewProcessResponse> responses = editorService.getAssignedReviews(editorId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/reviews/{reviewId}")
    public ResponseEntity<ReviewProcessResponse> getReview(@PathVariable Long reviewId) {
        ReviewProcessResponse response = editorService.getReview(reviewId);
        return ResponseEntity.ok(response);
    }
}
