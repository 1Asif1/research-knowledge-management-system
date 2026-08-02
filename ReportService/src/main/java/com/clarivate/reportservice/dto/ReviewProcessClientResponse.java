package com.clarivate.reportservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReviewProcessClientResponse {
    private Long reviewId;
    private Long paperId;
    private String paperTitle;
    private Long editorId;
    private Long reviewerId;
    private Integer currentVersion;
    private String reviewStatus;
    private String reviewerRecommendation;
    private String editorDecision;
}
