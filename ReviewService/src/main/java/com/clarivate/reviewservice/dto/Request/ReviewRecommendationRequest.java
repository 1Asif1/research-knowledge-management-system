package com.clarivate.reviewservice.dto.Request;

import com.clarivate.reviewservice.Enums.ReviewerRecommendation;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewRecommendationRequest {
    @NotNull
    private ReviewerRecommendation recommendation;
}
