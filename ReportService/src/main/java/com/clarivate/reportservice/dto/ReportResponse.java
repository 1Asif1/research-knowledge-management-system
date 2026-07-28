package com.clarivate.reportservice.dto;

import java.time.LocalDateTime;

public record ReportResponse(
        Long reportId,
        String reportType,
        LocalDateTime generatedDate,
        String title,
        Long authorId,
        String paperStatus,
        String payload
) {
}

