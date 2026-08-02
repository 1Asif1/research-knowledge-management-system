package com.clarivate.reportservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusHistoryReportDto {
    private Long historyId;
    private String action;
    private String performedBy;
    private String remarks;
    private LocalDateTime actionDate;
}
