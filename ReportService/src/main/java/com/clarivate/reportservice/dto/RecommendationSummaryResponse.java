package com.clarivate.reportservice.dto;

public record RecommendationSummaryResponse(
        long accept,
        long minorRevision,
        long majorRevision,
        long reject,
        long pending
) {
}
