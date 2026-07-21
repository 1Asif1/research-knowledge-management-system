package com.clarivate.reviewservice.Service;
import com.clarivate.reviewservice.dto.Request.ReviewCommentRequest;
import com.clarivate.reviewservice.dto.Request.ReviewRecommendationRequest;
import com.clarivate.reviewservice.dto.Response.ReviewCommentResponse;
import com.clarivate.reviewservice.dto.Response.ReviewProcessResponse;

import java.util.List;

public interface ReviewerService {
    List<ReviewProcessResponse> getAssignedReviews(Long reviewerId);
    ReviewCommentResponse addComment(ReviewCommentRequest request);
    ReviewProcessResponse submitRecommendations(Long reviewId, ReviewRecommendationRequest request);

    List<ReviewCommentResponse> getComments(Long reviewId);
}
