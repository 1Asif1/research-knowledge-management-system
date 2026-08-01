package com.clarivate.paperservice.Client;

import com.clarivate.paperservice.Dto.Request.ReviewSubmitPaperRequest;
import com.clarivate.paperservice.Dto.Request.ReviewUploadVersionRequest;
import com.clarivate.paperservice.Dto.Response.ReviewCommentResponse;
import com.clarivate.paperservice.Dto.Response.ReviewPaperSubmissionResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "review-service", url = "${review-service.url:http://localhost:8085}")
public interface ReviewServiceClient {

    @PostMapping("/api/researcher/papers")
    ReviewPaperSubmissionResponse submitPaper(@RequestBody ReviewSubmitPaperRequest request);

    @PutMapping("/api/researcher/papers/{paperId}/versions")
    ReviewPaperSubmissionResponse uploadVersion(
            @PathVariable Long paperId,
            @RequestBody ReviewUploadVersionRequest request
    );

    @GetMapping("/api/researcher/papers/{paperId}")
    ReviewPaperSubmissionResponse getSubmission(@PathVariable Long paperId);

    @GetMapping("/api/reviewer/reviews/{reviewId}/comments")
    List<ReviewCommentResponse> getReviewComments(@PathVariable Long reviewId);
}
