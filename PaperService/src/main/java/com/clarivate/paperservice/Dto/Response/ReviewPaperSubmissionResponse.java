package com.clarivate.paperservice.Dto.Response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewPaperSubmissionResponse {
    private Long paperId;
    private Long reviewId;
    private String title;
    private Long researcherId;
    private LocalDateTime submittedDate;
    private String reviewStatus;
    private Integer currentVersion;
}
