package com.clarivate.reportservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublishedPaperReportResponse {
    private Long paperId;
    private Long publicationId;
    private String title;
    private String description;
    private String authorName;
    private List<String> coAuthors;
    private String status;
    private LocalDateTime submittedDate;
    private LocalDate publishedDate;
    private Long completionTimeDays;
    private String completionTimeFormatted;
    private int totalVersionsSubmitted;
    private List<PaperVersionReportDto> versions;
    private List<StatusHistoryReportDto> statusHistory;
}
