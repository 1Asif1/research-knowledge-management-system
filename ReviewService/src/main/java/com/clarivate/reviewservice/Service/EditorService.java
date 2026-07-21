package com.clarivate.reviewservice.Service;

import com.clarivate.reviewservice.dto.Request.AssignReviewerRequest;
import com.clarivate.reviewservice.dto.Request.EditorDecisionRequest;
import com.clarivate.reviewservice.dto.Request.ReviewCommentRequest;
import com.clarivate.reviewservice.dto.Response.ReviewCommentResponse;
import com.clarivate.reviewservice.dto.Response.ReviewProcessResponse;

import java.util.List;

public interface EditorService {
    ReviewProcessResponse assignReviewer(AssignReviewerRequest request);
    ReviewProcessResponse makeFinalDecision(Long reviewId, EditorDecisionRequest request);
    List<ReviewProcessResponse> getPendingReviews();
    List<ReviewProcessResponse> getAssignedReviews(Long editorId);
    ReviewProcessResponse getReview(Long reviewId);
}
