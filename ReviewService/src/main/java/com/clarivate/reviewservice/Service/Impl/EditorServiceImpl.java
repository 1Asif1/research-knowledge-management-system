package com.clarivate.reviewservice.Service.Impl;

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

        return mapToResponse(updatedReview);
    }

    @Override
    public ReviewProcessResponse makeFinalDecision(Long reviewId, EditorDecisionRequest request) {
        ReviewProcess reviewProcess = reviewProcessRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review not found with id: " + reviewId));

        EditorDecision decision = request.getDecision();
        reviewProcess.setEditorDecision(decision.toString());
        if (decision == EditorDecision.ACCEPT) {
            reviewProcess.setReviewStatus(ReviewStatus.SENT_TO_PUBLICATION.toString());
        } else if (decision == EditorDecision.REJECT) {
            reviewProcess.setReviewStatus(ReviewStatus.REJECTED.toString());
        }
        reviewProcess.setLastUpdated(LocalDateTime.now());
        ReviewProcess updatedReview = reviewProcessRepository.save(reviewProcess);
        String paperStatus = mapPaperStatus(decision);
        if (paperStatus != null) {
            syncPaperStatus(reviewProcess.getPaperId(), paperStatus);
        }

        ReviewHistory history = ReviewHistory.builder()
                .reviewProcess(reviewProcess)
                .action("Final Decision Made")
                .performedBy(String.valueOf(reviewProcess.getEditorId()))
                .remarks("Decision: " + request.getDecision())
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
}