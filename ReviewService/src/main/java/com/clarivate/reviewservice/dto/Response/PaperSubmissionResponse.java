package com.clarivate.reviewservice.dto.Response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaperSubmissionResponse {
    private Long paperId;
    private String title;
    private Long researcherId;
    private LocalDateTime submittedDate;
}
