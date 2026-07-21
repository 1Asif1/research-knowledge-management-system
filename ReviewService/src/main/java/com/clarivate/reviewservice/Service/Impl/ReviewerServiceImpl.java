package com.clarivate.reviewservice.Service.Impl;

import com.clarivate.reviewservice.Entity.ReviewProcess;
import com.clarivate.reviewservice.Entity.ReviewComment;
import com.clarivate.reviewservice.Entity.ReviewHistory;
import com.clarivate.reviewservice.Entity.PaperVersion;
import com.clarivate.reviewservice.Entity.ReviewerAssignment;
import com.clarivate.reviewservice.Enums.ReviewStatus;
import com.clarivate.reviewservice.Enums.ReviewerRecommendation;
import com.clarivate.reviewservice.Enums.AssignmentStatus;
import com.clarivate.reviewservice.Repository.ReviewProcessRepository;
import com.clarivate.reviewservice.Repository.ReviewCommentRepository;
import com.clarivate.reviewservice.Repository.ReviewHistoryRepository;
import com.clarivate.reviewservice.Repository.PaperVersionRepository;
import com.clarivate.reviewservice.Repository.ReviewerAssignmentRepository;
import com.clarivate.reviewservice.Service.ReviewerService;
import com.clarivate.reviewservice.dto.Request.ReviewCommentRequest;
import com.clarivate.reviewservice.dto.Request.ReviewRecommendationRequest;
import com.clarivate.reviewservice.dto.Response.ReviewCommentResponse;
import com.clarivate.reviewservice.dto.Response.ReviewProcessResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewerServiceImpl implements ReviewerService {
    private final ReviewProcessRepository reviewProcessRepository;
    private final ReviewCommentRepository reviewCommentRepository;
    private final ReviewHistoryRepository reviewHistoryRepository;
    private final PaperVersionRepository paperVersionRepository;
    private final ReviewerAssignmentRepository reviewerAssignmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ReviewProcessResponse> getAssignedReviews(Long reviewerId) {
        return reviewerAssignmentRepository.findByReviewerId(reviewerId)
                .stream()
                .map(assignment -> mapReviewToResponse(assignment.getReviewProcess()))
                .collect(Collectors.toList());
    }

    @Override
    public ReviewCommentResponse addComment(ReviewCommentRequest request) {
        ReviewProcess reviewProcess = reviewProcessRepository.findById(request.getReviewId())
                .orElseThrow(() -> new EntityNotFoundException("Review not found with id: " + request.getReviewId()));

        PaperVersion paperVersion = paperVersionRepository.findById(request.getVersionId().intValue())
                .orElseThrow(() -> new EntityNotFoundException("Paper version not found with id: " + request.getVersionId()));

        ReviewComment comment = ReviewComment.builder()
                .reviewProcess(reviewProcess)
                .paperVersion(paperVersion)
                .reviewId(request.getReviewId())
                .comment(request.getComment())
                .createdDate(LocalDateTime.now())
                .build();

        ReviewComment savedComment = reviewCommentRepository.save(comment);

        return mapCommentToResponse(savedComment);
    }

    @Override
    public ReviewProcessResponse submitRecommendations(Long reviewId, ReviewRecommendationRequest request) {
        ReviewProcess reviewProcess = reviewProcessRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review not found with id: " + reviewId));

        reviewProcess.setReviewRecommendation(request.getRecommendation().toString());
        reviewProcess.setReviewStatus(ReviewStatus.UNDER_REVIEW.toString());
        reviewProcess.setLastUpdated(LocalDateTime.now());
        ReviewProcess updatedReview = reviewProcessRepository.save(reviewProcess);

        ReviewHistory history = ReviewHistory.builder()
                .reviewProcess(reviewProcess)
                .action("Review Recommendation Submitted")
                .performedBy(String.valueOf(reviewProcess.getAssignedReviewerId()))
                .remarks("Recommendation: " + request.getRecommendation())
                .actionDate(LocalDateTime.now())
                .build();
        reviewHistoryRepository.save(history);

        ReviewerAssignment assignment = reviewerAssignmentRepository
                .findByReviewProcessReviewId(reviewId)
                .stream()
                .findFirst()
                .orElse(null);

        if (assignment != null) {
            assignment.setAssignmentStatus(AssignmentStatus.COMPLETED);
            reviewerAssignmentRepository.save(assignment);
        }

        return mapReviewToResponse(updatedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewCommentResponse> getComments(Long reviewId) {
        return reviewCommentRepository.findByReviewProcessReviewId(reviewId)
                .stream()
                .map(this::mapCommentToResponse)
                .collect(Collectors.toList());
    }

    private ReviewProcessResponse mapReviewToResponse(ReviewProcess review) {
        return ReviewProcessResponse.builder()
                .reviewId(review.getReviewId())
                .paperId(review.getPaperId())
                .editorId(review.getEditorId() > 0 ? review.getEditorId() : null)
                .reviewerId(review.getAssignedReviewerId() > 0 ? review.getAssignedReviewerId() : null)
                .currentVersion(review.getCurrentVersion())
                .reviewStatus(ReviewStatus.valueOf(review.getReviewStatus()))
                .reviewerRecommendation(review.getReviewRecommendation() != null ?
                        ReviewerRecommendation.valueOf(review.getReviewRecommendation()) : null)
                .editorDecision(review.getEditorDecision() != null ?
                        com.clarivate.reviewservice.Enums.EditorDecision.valueOf(review.getEditorDecision()) : null)
                .build();
    }

    private ReviewCommentResponse mapCommentToResponse(ReviewComment comment) {
        return ReviewCommentResponse.builder()
                .commentId(comment.getCommentId())
                .reviewerId(comment.getReviewId())
                .comment(comment.getComment())
                .createdDate(comment.getCreatedDate())
                .build();
    }
}
