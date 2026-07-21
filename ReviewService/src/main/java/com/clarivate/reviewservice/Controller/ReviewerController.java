package com.clarivate.reviewservice.Controller;

import com.clarivate.reviewservice.Service.ReviewerService;
import com.clarivate.reviewservice.dto.Request.ReviewCommentRequest;
import com.clarivate.reviewservice.dto.Request.ReviewRecommendationRequest;
import com.clarivate.reviewservice.dto.Response.ReviewCommentResponse;
import com.clarivate.reviewservice.dto.Response.ReviewProcessResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviewer")
@RequiredArgsConstructor
public class ReviewerController {
    private final ReviewerService reviewerService;

    @GetMapping("/{reviewerId}/reviews")
    public ResponseEntity<List<ReviewProcessResponse>> getAssignedReviews(@PathVariable Long reviewerId) {
        List<ReviewProcessResponse> responses = reviewerService.getAssignedReviews(reviewerId);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/comments")
    public ResponseEntity<ReviewCommentResponse> addComment(@Valid @RequestBody ReviewCommentRequest request) {
        ReviewCommentResponse response = reviewerService.addComment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/reviews/{reviewId}/recommendation")
    public ResponseEntity<ReviewProcessResponse> submitRecommendation(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRecommendationRequest request) {
        ReviewProcessResponse response = reviewerService.submitRecommendations(reviewId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reviews/{reviewId}/comments")
    public ResponseEntity<List<ReviewCommentResponse>> getComments(@PathVariable Long reviewId) {
        List<ReviewCommentResponse> responses = reviewerService.getComments(reviewId);
        return ResponseEntity.ok(responses);
    }
}
