package com.clarivate.reviewservice.dto.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewCommentRequest {
    @NotNull(message = "reviewId is required")
    private Long reviewId;
    @NotNull(message = "versionId is required")
    private Long versionId;
    @NotNull(message = "reviewerId is required")
    private Long reviewerId;
    @NotBlank(message = "Comment is required")
    @Size(min = 20, max = 3000,
            message = "Comment must be between 20 and 3000 characters")
    private String comment;
}
