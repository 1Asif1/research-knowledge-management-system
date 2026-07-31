package com.clarivate.paperservice.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResearcherPaperResponse {
    private Long paperId;
    private Long reviewId;
    private String title;
    private Long researcherId;
    private LocalDateTime submittedDate;
    private String reviewStatus;
    private Integer currentVersion;
}
