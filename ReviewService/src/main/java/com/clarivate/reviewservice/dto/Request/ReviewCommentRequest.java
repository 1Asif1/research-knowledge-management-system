package com.clarivate.reviewservice.dto.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewCommentRequest {
    @NotNull
    private Long reviewId;
    @NotNull
    private Long versionId;
    @NotNull
    private Long reviewerId;
    @NotBlank
    private String comment;
}
