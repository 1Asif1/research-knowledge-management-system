package com.clarivate.reviewservice.dto.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignReviewerRequest {
    @NotNull
    private Long reviewId;
    @NotNull
    private Long reviewerId;
    @NotNull
    private Long editorId;
}
