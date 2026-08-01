package com.clarivate.paperservice.Dto.Response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewCommentResponse {
    private Long commentId;
    private Long reviewerId;
    private String comment;
    private LocalDateTime createdDate;
}
