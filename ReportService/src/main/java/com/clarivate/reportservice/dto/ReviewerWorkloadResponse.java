package com.clarivate.reportservice.dto;

public record ReviewerWorkloadResponse(
        long reviewerId,
        long assigned,
        long completed,
        long pending
) {
}
