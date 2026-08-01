package com.clarivate.reviewservice.dto.Response;

import com.clarivate.reviewservice.Enums.EditorDecision;
import com.clarivate.reviewservice.Enums.ReviewStatus;
import com.clarivate.reviewservice.Enums.ReviewerRecommendation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewProcessResponse {

    private Long reviewId;

    private Long paperId;

    private String paperTitle;

    private Long editorId;

    private Long reviewerId;

    private Integer currentVersion;

    /*
     * Database ID of the current PaperVersion.
     * The reviewer frontend uses this while adding comments.
     */
    private Long currentVersionId;

    private ReviewStatus reviewStatus;

    private ReviewerRecommendation reviewerRecommendation;

    private EditorDecision editorDecision;
}