package com.clarivate.reviewservice.dto.Response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewCommentResponse {
    private Long commentId;
    private Long reviewerId;
    private String comment;
    private LocalDateTime createdDate;
}
