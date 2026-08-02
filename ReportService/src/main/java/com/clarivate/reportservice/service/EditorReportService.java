package com.clarivate.reportservice.service;

import com.clarivate.reportservice.client.WorkflowServiceClient;
import com.clarivate.reportservice.dto.EditorReportSummaryResponse;
import com.clarivate.reportservice.dto.PublicationClientResponse;
import com.clarivate.reportservice.dto.RecommendationSummaryResponse;
import com.clarivate.reportservice.dto.ReviewProcessClientResponse;
import com.clarivate.reportservice.dto.ReviewerWorkloadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EditorReportService {

    private static final String PENDING = "PENDING";
    private static final String ACCEPT = "ACCEPT";
    private static final String REJECT = "REJECT";
    private static final String MINOR_REVISION = "MINOR_REVISION";
    private static final String MAJOR_REVISION = "MAJOR_REVISION";
    private static final String SUBMITTED = "SUBMITTED";

    private final WorkflowServiceClient workflowServiceClient;

    public EditorReportSummaryResponse getEditorSummary(Long editorId) {
        if (editorId == null || editorId <= 0) {
            throw new IllegalArgumentException("editorId must be a positive value");
        }

        List<ReviewProcessClientResponse> pending = workflowServiceClient.getPendingReviews();
        List<ReviewProcessClientResponse> assigned = workflowServiceClient.getEditorReviews(editorId);
        List<PublicationClientResponse> publications = workflowServiceClient.getPublications();

        Map<Long, ReviewProcessClientResponse> uniqueReviews = new LinkedHashMap<>();
        addReviews(uniqueReviews, pending);
        addReviews(uniqueReviews, assigned);

        Set<Long> publishedPaperIds = new HashSet<>();
        for (PublicationClientResponse publication : publications) {
            if (publication != null && publication.getPaperId() != null) {
                publishedPaperIds.add(publication.getPaperId());
            }
        }

        long totalPapers = uniqueReviews.size();
        long pendingAssignment = 0;
        long underReview = 0;
        long awaitingDecision = 0;
        long accepted = 0;
        long rejected = 0;
        long published = 0;

        long recAccept = 0;
        long recMinor = 0;
        long recMajor = 0;
        long recReject = 0;
        long recPending = 0;

        Map<Long, long[]> reviewerStats = new HashMap<>();

        for (ReviewProcessClientResponse review : uniqueReviews.values()) {
            String editorDecision = normalize(review.getEditorDecision());
            String recommendation = normalize(review.getReviewerRecommendation());
            String status = normalize(review.getReviewStatus());
            Long paperId = review.getPaperId();
            Long reviewerId = review.getReviewerId();
            boolean hasReviewer = reviewerId != null && reviewerId > 0;
            boolean isPublished = paperId != null && publishedPaperIds.contains(paperId);

            if (isPublished) {
                published++;
            } else if (ACCEPT.equals(editorDecision)) {
                accepted++;
            }

            if (REJECT.equals(editorDecision)) {
                rejected++;
            }

            if (!hasReviewer || SUBMITTED.equals(status)) {
                pendingAssignment++;
            }

            boolean recPresent = recommendation != null && !recommendation.isEmpty()
                    && !PENDING.equals(recommendation);
            boolean decisionPending = editorDecision == null || editorDecision.isEmpty()
                    || PENDING.equals(editorDecision);

            if (recPresent && decisionPending) {
                awaitingDecision++;
            }

            if (hasReviewer && !recPresent && decisionPending) {
                underReview++;
            }

            switch (recommendation == null ? "" : recommendation) {
                case ACCEPT -> recAccept++;
                case MINOR_REVISION -> recMinor++;
                case MAJOR_REVISION -> recMajor++;
                case REJECT -> recReject++;
                default -> recPending++;
            }

            if (hasReviewer) {
                long[] stats = reviewerStats.computeIfAbsent(reviewerId, id -> new long[2]);
                stats[0] = stats[0] + 1;
                if (recPresent) {
                    stats[1] = stats[1] + 1;
                }
            }
        }

        RecommendationSummaryResponse recommendations = new RecommendationSummaryResponse(
                recAccept, recMinor, recMajor, recReject, recPending
        );

        List<ReviewerWorkloadResponse> workloads = new ArrayList<>();
        for (Map.Entry<Long, long[]> entry : reviewerStats.entrySet()) {
            long assignedCount = entry.getValue()[0];
            long completed = entry.getValue()[1];
            long pendingCount = Math.max(0, assignedCount - completed);
            workloads.add(new ReviewerWorkloadResponse(
                    entry.getKey(), assignedCount, completed, pendingCount
            ));
        }

        workloads.sort(Comparator
                .comparingLong(ReviewerWorkloadResponse::pending).reversed()
                .thenComparing(Comparator.comparingLong(ReviewerWorkloadResponse::assigned).reversed())
                .thenComparingLong(ReviewerWorkloadResponse::reviewerId));

        return new EditorReportSummaryResponse(
                editorId,
                totalPapers,
                pendingAssignment,
                underReview,
                awaitingDecision,
                accepted,
                rejected,
                published,
                recommendations,
                workloads
        );
    }

    private void addReviews(Map<Long, ReviewProcessClientResponse> target,
                            List<ReviewProcessClientResponse> reviews) {
        if (reviews == null) {
            return;
        }
        for (ReviewProcessClientResponse review : reviews) {
            if (review == null || review.getReviewId() == null) {
                continue;
            }
            target.putIfAbsent(review.getReviewId(), review);
        }
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? "" : trimmed.toUpperCase();
    }
}
