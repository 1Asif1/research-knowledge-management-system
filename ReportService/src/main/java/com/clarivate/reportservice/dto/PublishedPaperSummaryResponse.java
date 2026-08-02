package com.clarivate.reportservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublishedPaperSummaryResponse {
    private Long paperId;
    private Long publicationId;
    private String title;
    private String authorName;
    private LocalDate publishedDate;
}
