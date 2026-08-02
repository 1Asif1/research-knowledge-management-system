package com.clarivate.reportservice.dto;

import java.util.List;

public record EditorReportSummaryResponse(
        long editorId,
        long totalPapers,
        long pendingAssignment,
        long underReview,
        long awaitingDecision,
        long accepted,
        long rejected,
        long published,
        RecommendationSummaryResponse recommendations,
        List<ReviewerWorkloadResponse> reviewerWorkloads
) {
}
