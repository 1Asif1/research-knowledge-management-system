package com.clarivate.reviewservice.Service.Impl;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.HashMap;
import com.clarivate.reviewservice.Client.PaperServiceClient;
import com.clarivate.reviewservice.Entity.ReviewProcess;
import com.clarivate.reviewservice.Entity.ReviewerAssignment;
import com.clarivate.reviewservice.Entity.ReviewHistory;
import com.clarivate.reviewservice.Enums.AssignmentStatus;
import com.clarivate.reviewservice.Enums.EditorDecision;
import com.clarivate.reviewservice.Enums.ReviewStatus;
import com.clarivate.reviewservice.Enums.ReviewerRecommendation;
import com.clarivate.reviewservice.Repository.PaperSubmissionRepository;
import com.clarivate.reviewservice.Repository.ReviewProcessRepository;
import com.clarivate.reviewservice.Repository.ReviewerAssignmentRepository;
import com.clarivate.reviewservice.Repository.ReviewHistoryRepository;
import com.clarivate.reviewservice.Service.EditorService;
import com.clarivate.reviewservice.dto.Request.AssignReviewerRequest;
import com.clarivate.reviewservice.dto.Request.EditorDecisionRequest;
import com.clarivate.reviewservice.dto.Response.AvailableReviewerResponse;
import com.clarivate.reviewservice.dto.Response.ReviewProcessResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EditorServiceImpl implements EditorService {
    private final ReviewProcessRepository reviewProcessRepository;
    private final ReviewerAssignmentRepository reviewerAssignmentRepository;
    private final ReviewHistoryRepository reviewHistoryRepository;
    private final PaperSubmissionRepository paperSubmissionRepository;
    private final PaperServiceClient paperServiceClient;
    private final RestTemplate restTemplate = new RestTemplate();
    @Value("${user-service.url:http://localhost:8081}")
    private String userServiceUrl;
    @Value("${notification-service.url:http://localhost:8084}")
    private String notificationServiceUrl;

    @Override
    public ReviewProcessResponse assignReviewer(AssignReviewerRequest request) {
        ReviewProcess reviewProcess = reviewProcessRepository.findById(request.getReviewId())
                .orElseThrow(() -> new EntityNotFoundException("Review not found with id: " + request.getReviewId()));

        reviewProcess.setAssignedReviewerId(request.getReviewerId());
        reviewProcess.setEditorId(request.getEditorId());
        reviewProcess.setReviewStatus(ReviewStatus.REVIEWER_ASSIGNED.toString());
        reviewProcess.setLastUpdated(LocalDateTime.now());
        ReviewProcess updatedReview = reviewProcessRepository.save(reviewProcess);

        ReviewerAssignment assignment = ReviewerAssignment.builder()
                .reviewProcess(reviewProcess)
                .reviewerId(request.getReviewerId())
                .assignedByEditorId(request.getEditorId())
                .assignedDate(LocalDateTime.now())
                .assignmentStatus(AssignmentStatus.ASSIGNED)
                .build();
        reviewerAssignmentRepository.save(assignment);

        ReviewHistory history = ReviewHistory.builder()
                .reviewProcess(reviewProcess)
                .action("Reviewer Assigned")
                .performedBy(request.getEditorId().toString())
                .remarks("Reviewer " + request.getReviewerId() + " assigned")
                .actionDate(LocalDateTime.now())
                .build();
        reviewHistoryRepository.save(history);

        sendNotification(
                request.getReviewerId(),
                "Review Assigned",
                "You have been assigned to review \""
                        + resolvePaperTitle(reviewProcess.getPaperId())
                        + "\".",
                "REVIEW_ASSIGNED"
        );

        return mapToResponse(updatedReview);
    }

    @Override
    public ReviewProcessResponse makeFinalDecision(
            Long reviewId,
            EditorDecisionRequest request
    ) {
        ReviewProcess reviewProcess =
                reviewProcessRepository.findById(reviewId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Review not found with id: " + reviewId
                                )
                        );

        /*
         * The editor cannot make a final decision until
         * the reviewer has submitted a recommendation.
         */
        if (reviewProcess.getReviewRecommendation() == null
                || reviewProcess.getReviewRecommendation().isBlank()) {
            throw new IllegalStateException(
                    "The reviewer must submit a recommendation before "
                            + "the editor can make a final decision."
            );
        }

        /*
         * Also verify that the reviewer assignment was completed.
         */
        ReviewerAssignment assignment =
                reviewerAssignmentRepository
                        .findByReviewProcessReviewId(reviewId)
                        .stream()
                        .findFirst()
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Reviewer assignment was not found "
                                                + "for review id: " + reviewId
                                )
                        );

        if (assignment.getAssignmentStatus()
                != AssignmentStatus.COMPLETED) {
            throw new IllegalStateException(
                    "The reviewer must complete the review before "
                            + "the editor can make a final decision."
            );
        }

        /*
         * Prevent the editor from changing an existing final decision.
         */
        if (reviewProcess.getEditorDecision() != null
                && !reviewProcess.getEditorDecision().isBlank()) {
            throw new IllegalStateException(
                    "A final editorial decision has already been submitted."
            );
        }

        EditorDecision decision = request.getDecision();

        if (decision == null || decision == EditorDecision.PENDING) {
            throw new IllegalArgumentException(
                    "Please select either ACCEPT or REJECT."
            );
        }

        reviewProcess.setEditorDecision(decision.toString());

        if (decision == EditorDecision.ACCEPT) {
            reviewProcess.setReviewStatus(
                    ReviewStatus.SENT_TO_PUBLICATION.toString()
            );
        } else if (decision == EditorDecision.REJECT) {
            reviewProcess.setReviewStatus(
                    ReviewStatus.REJECTED.toString()
            );
        }

        reviewProcess.setLastUpdated(LocalDateTime.now());

        ReviewProcess updatedReview =
                reviewProcessRepository.save(reviewProcess);

        String paperStatus = mapPaperStatus(decision);

        if (paperStatus != null) {
            syncPaperStatus(
                    reviewProcess.getPaperId(),
                    paperStatus
            );
        }

        ReviewHistory history = ReviewHistory.builder()
                .reviewProcess(reviewProcess)
                .action("Final Decision Made")
                .performedBy(
                        String.valueOf(
                                reviewProcess.getEditorId()
                        )
                )
                .remarks("Decision: " + decision)
                .actionDate(LocalDateTime.now())
                .build();

        reviewHistoryRepository.save(history);

        return mapToResponse(updatedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewProcessResponse> getPendingReviews() {
        return reviewProcessRepository.findByReviewStatus(ReviewStatus.SUBMITTED.toString())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewProcessResponse> getAssignedReviews(Long editorId) {
        return reviewProcessRepository.findByEditorId(editorId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewProcessResponse getReview(Long reviewId) {
        ReviewProcess reviewProcess = reviewProcessRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review not found with id: " + reviewId));

        return mapToResponse(reviewProcess);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AvailableReviewerResponse> getAvailableReviewers() {
        String endpoint = userServiceUrl + "/users";
        try {
            ResponseEntity<UserDirectoryEntry[]> response = restTemplate.getForEntity(endpoint, UserDirectoryEntry[].class);
            UserDirectoryEntry[] users = response.getBody();
            if (users == null) {
                return Collections.emptyList();
            }
            return Arrays.stream(users)
                    .filter(user -> user.role != null && "REVIEWER".equalsIgnoreCase(user.role))
                    .map(user -> AvailableReviewerResponse.builder()
                            .id(user.id)
                            .firstName(user.firstName)
                            .lastName(user.lastName)
                            .build())
                    .toList();
        } catch (Exception ex) {
            return Collections.emptyList();
        }
    }

    private ReviewProcessResponse mapToResponse(ReviewProcess review) {
        return ReviewProcessResponse.builder()
                .reviewId(review.getReviewId())
                .paperId(review.getPaperId())
                .paperTitle(paperSubmissionRepository.findById(Math.toIntExact(review.getPaperId()))
                        .map(submission -> submission.getTitle())
                        .orElse("Paper #" + review.getPaperId()))
                .editorId(review.getEditorId() > 0 ? review.getEditorId() : null)
                .reviewerId(review.getAssignedReviewerId() > 0 ? review.getAssignedReviewerId() : null)
                .currentVersion(review.getCurrentVersion())
                .reviewStatus(ReviewStatus.valueOf(review.getReviewStatus()))
                .reviewerRecommendation(review.getReviewRecommendation() != null ?
                        ReviewerRecommendation.valueOf(review.getReviewRecommendation()) : null)
                .editorDecision(review.getEditorDecision() != null ?
                        EditorDecision.valueOf(review.getEditorDecision()) : null)
                .build();
    }

    private static final class UserDirectoryEntry {
        public Long id;
        public String firstName;
        public String lastName;
        public String role;
    }

    private String mapPaperStatus(EditorDecision decision) {
        return switch (decision) {
            case ACCEPT -> "APPROVED";
            case REJECT -> "REJECTED";
            case PENDING -> null;
        };
    }

    private void syncPaperStatus(Long paperId, String status) {
        paperServiceClient.updateStatus(paperId, status);
    }

    private String resolvePaperTitle(Long paperId) {
        return paperSubmissionRepository
                .findById(Math.toIntExact(paperId))
                .map(submission -> submission.getTitle())
                .orElse("Paper #" + paperId);
    }

    private void sendNotification(
            Long userId,
            String title,
            String message,
            String type
    ) {
        Map<String, Object> body = new HashMap<>();

        body.put("userId", userId);
        body.put("title", title);
        body.put("message", message);
        body.put("type", type);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(
                    notificationServiceUrl + "/notifications",
                    request,
                    Object.class
            );
        } catch (Exception exception) {
            /*
             * Assignment must remain successful even if the
             * notification service is temporarily unavailable.
             */
            System.err.println(
                    "Reviewer was assigned, but notification creation failed: "
                            + exception.getMessage()
            );
        }
    }
}