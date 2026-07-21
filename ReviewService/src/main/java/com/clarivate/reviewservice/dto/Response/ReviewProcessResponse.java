package com.clarivate.reviewservice.dto.Response;

import com.clarivate.reviewservice.Enums.EditorDecision;
import com.clarivate.reviewservice.Enums.ReviewStatus;
import com.clarivate.reviewservice.Enums.ReviewerRecommendation;
import com.clarivate.reviewservice.dto.Request.EditorDecisionRequest;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewProcessResponse {
    private Long reviewId;
    private Long paperId;
    private Long editorId;
    private Long reviewerId;
    private Integer currentVersion;
    private ReviewStatus reviewStatus;
    private ReviewerRecommendation reviewerRecommendation;
    private EditorDecision editorDecision;
}
