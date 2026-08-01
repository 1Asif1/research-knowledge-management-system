package com.clarivate.reviewservice.Service.Impl;

import com.clarivate.reviewservice.Entity.PaperVersion;
import com.clarivate.reviewservice.Entity.PaperSubmission;
import com.clarivate.reviewservice.Entity.ReviewComment;
import com.clarivate.reviewservice.Entity.ReviewHistory;
import com.clarivate.reviewservice.Entity.ReviewProcess;
import com.clarivate.reviewservice.Entity.ReviewerAssignment;
import com.clarivate.reviewservice.Enums.AssignmentStatus;
import com.clarivate.reviewservice.Enums.EditorDecision;
import com.clarivate.reviewservice.Enums.ReviewStatus;
import com.clarivate.reviewservice.Enums.ReviewerRecommendation;
import com.clarivate.reviewservice.Exception.BadRequestException;
import com.clarivate.reviewservice.Exception.ResourceNotFoundException;
import com.clarivate.reviewservice.Repository.PaperSubmissionRepository;
import com.clarivate.reviewservice.Repository.PaperVersionRepository;
import com.clarivate.reviewservice.Repository.ReviewCommentRepository;
import com.clarivate.reviewservice.Repository.ReviewHistoryRepository;
import com.clarivate.reviewservice.Repository.ReviewProcessRepository;
import com.clarivate.reviewservice.Repository.ReviewerAssignmentRepository;
import com.clarivate.reviewservice.Service.ReviewerService;
import com.clarivate.reviewservice.dto.Request.ReviewCommentRequest;
import com.clarivate.reviewservice.dto.Request.ReviewRecommendationRequest;
import com.clarivate.reviewservice.dto.Response.ReviewCommentResponse;
import com.clarivate.reviewservice.dto.Response.ReviewProcessResponse;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ReviewerServiceImpl implements ReviewerService {

    private final ReviewProcessRepository reviewProcessRepository;
    private final ReviewCommentRepository reviewCommentRepository;
    private final ReviewHistoryRepository reviewHistoryRepository;
    private final PaperVersionRepository paperVersionRepository;
    private final PaperSubmissionRepository paperSubmissionRepository;
    private final ReviewerAssignmentRepository reviewerAssignmentRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    @Value("${notification-service.url:http://localhost:8084}")
    private String notificationServiceUrl;

    @Override
    @Transactional(readOnly = true)
    public List<ReviewProcessResponse> getAssignedReviews(Long reviewerId) {
        return reviewerAssignmentRepository
                .findByReviewerId(reviewerId)
                .stream()
                .map(assignment ->
                        mapReviewToResponse(assignment.getReviewProcess())
                )
                .collect(Collectors.toList());
    }

    @Override
    public ReviewCommentResponse addComment(
            ReviewCommentRequest request
    ) {
        ReviewProcess reviewProcess = reviewProcessRepository
                .findById(request.getReviewId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Review not found with id: " + request.getReviewId()
                        )
                );

        boolean isAssignedReviewer = !reviewerAssignmentRepository
                .findByReviewProcessReviewIdAndReviewerId(
                        reviewProcess.getReviewId(),
                        request.getReviewerId())
                .isEmpty();
        if (!isAssignedReviewer) {
            throw new BadRequestException("You are not assigned to this review.");
        }

        PaperVersion paperVersion = resolveCommentVersion(reviewProcess, request.getVersionId());

        ReviewComment comment = ReviewComment.builder()
                .reviewProcess(reviewProcess)
                .paperVersion(paperVersion)
                .reviewerId(request.getReviewerId())
                .comment(request.getComment())
                .createdDate(LocalDateTime.now())
                .build();

        ReviewComment savedComment =
                reviewCommentRepository.save(comment);

        reviewProcess.setLastUpdated(LocalDateTime.now());
        reviewProcessRepository.save(reviewProcess);
        sendResearcherNotification(
                reviewProcess,
                "New Review Comment",
                "A reviewer added a new comment on \"" + resolvePaperTitle(reviewProcess.getPaperId()) + "\".",
                "REVISION_REQUESTED");

        return mapCommentToResponse(savedComment);
    }

    @Override
    public ReviewProcessResponse submitRecommendations(
            Long reviewId,
            ReviewRecommendationRequest request
    ) {
        ReviewProcess reviewProcess = reviewProcessRepository
                .findById(reviewId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Review not found with id: " + reviewId
                        )
                );

        reviewProcess.setReviewRecommendation(
                request.getRecommendation().toString()
        );

        /*
         * Keep the review process under review until the editor
         * makes the final editorial decision.
         */
        reviewProcess.setReviewStatus(
                ReviewStatus.UNDER_REVIEW.toString()
        );

        reviewProcess.setLastUpdated(LocalDateTime.now());

        ReviewProcess updatedReview =
                reviewProcessRepository.save(reviewProcess);

        ReviewHistory history = ReviewHistory.builder()
                .reviewProcess(reviewProcess)
                .action("Review Recommendation Submitted")
                .performedBy(
                        String.valueOf(
                                reviewProcess.getAssignedReviewerId()
                        )
                )
                .remarks(
                        "Recommendation: "
                                + request.getRecommendation()
                )
                .actionDate(LocalDateTime.now())
                .build();

        reviewHistoryRepository.save(history);

        ReviewerAssignment assignment =
                reviewerAssignmentRepository
                        .findByReviewProcessReviewId(reviewId)
                        .stream()
                        .findFirst()
                        .orElse(null);

        if (assignment != null) {
            assignment.setAssignmentStatus(
                    AssignmentStatus.COMPLETED
            );

            reviewerAssignmentRepository.save(assignment);
        }

        sendResearcherNotification(
                reviewProcess,
                "Review Recommendation Submitted",
                "A reviewer submitted a " + request.getRecommendation()
                        + " recommendation for \"" + resolvePaperTitle(reviewProcess.getPaperId()) + "\".",
                "REVIEW_COMPLETED");

        return mapReviewToResponse(updatedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewCommentResponse> getComments(Long reviewId) {
        return reviewCommentRepository
                .findByReviewProcessReviewId(reviewId)
                .stream()
                .map(this::mapCommentToResponse)
                .collect(Collectors.toList());
    }

    private ReviewProcessResponse mapReviewToResponse(
            ReviewProcess review
    ) {
        Long currentVersionId = paperVersionRepository
                .findByPaperSubmissionPaperIdAndVersionNumber(
                        review.getPaperId(),
                        review.getCurrentVersion()
                )
                .map(PaperVersion::getVersionId)
                .orElse(null);

        return ReviewProcessResponse.builder()
                .reviewId(review.getReviewId())
                .paperId(review.getPaperId())
                .paperTitle(paperSubmissionRepository.findById(Math.toIntExact(review.getPaperId()))
                        .map(submission -> submission.getTitle())
                        .orElse("Untitled Paper"))
                .editorId(
                        review.getEditorId() > 0
                                ? review.getEditorId()
                                : null
                )
                .reviewerId(
                        review.getAssignedReviewerId() > 0
                                ? review.getAssignedReviewerId()
                                : null
                )
                .currentVersion(review.getCurrentVersion())
                .currentVersionId(currentVersionId)
                .reviewStatus(
                        parseReviewStatus(review.getReviewStatus())
                )
                .reviewerRecommendation(
                        parseReviewerRecommendation(
                                review.getReviewRecommendation()
                        )
                )
                .editorDecision(
                        parseEditorDecision(
                                review.getEditorDecision()
                        )
                )
                .build();
    }

    private PaperVersion resolveCommentVersion(ReviewProcess reviewProcess, Long requestedVersionId) {
        if (requestedVersionId != null) {
            var requestedVersion = paperVersionRepository.findByVersionIdAndPaperSubmissionPaperId(
                    requestedVersionId,
                    reviewProcess.getPaperId());
            if (requestedVersion.isPresent()) {
                return requestedVersion.get();
            }
        }

        return paperVersionRepository.findByPaperSubmissionPaperIdAndVersionNumber(
                        reviewProcess.getPaperId(),
                        reviewProcess.getCurrentVersion())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Paper version not found for paper "
                                        + reviewProcess.getPaperId()
                                        + " at version "
                                        + reviewProcess.getCurrentVersion()));
    }

    private ReviewStatus parseReviewStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        return ReviewStatus.valueOf(status);
    }

    private ReviewerRecommendation parseReviewerRecommendation(
            String recommendation
    ) {
        if (recommendation == null || recommendation.isBlank()) {
            return null;
        }

        return ReviewerRecommendation.valueOf(recommendation);
    }

    private EditorDecision parseEditorDecision(String decision) {
        if (decision == null || decision.isBlank()) {
            return null;
        }

        return EditorDecision.valueOf(decision);
    }

    private ReviewCommentResponse mapCommentToResponse(
            ReviewComment comment
    ) {
        return ReviewCommentResponse.builder()
                .commentId(comment.getCommentId())
                .reviewerId(comment.getReviewerId())
                .comment(comment.getComment())
                .createdDate(comment.getCreatedDate())
                .build();
    }

    private String resolvePaperTitle(long paperId) {
        return paperSubmissionRepository.findById(Math.toIntExact(paperId))
                .map(PaperSubmission::getTitle)
                .orElse("your paper");
    }

    private void sendResearcherNotification(
            ReviewProcess reviewProcess,
            String title,
            String message,
            String type) {
        PaperSubmission submission = paperSubmissionRepository.findById(Math.toIntExact(reviewProcess.getPaperId()))
                .orElse(null);
        if (submission == null) {
            return;
        }

        Map<String, Object> body = new HashMap<>();
        body.put("userId", submission.getResearcherId());
        body.put("title", title);
        body.put("message", message);
        body.put("type", type);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(notificationServiceUrl + "/notifications", request, Object.class);
        } catch (Exception ex) {
            log.warn("Failed to send review notification for paper {}", reviewProcess.getPaperId(), ex);
        }
    }
}