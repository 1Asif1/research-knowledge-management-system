package com.clarivate.reportservice.dto;

public record AnnualReportSummaryResponse(
        int year,
        long totalReports,
        long publicationReports
) {
}

