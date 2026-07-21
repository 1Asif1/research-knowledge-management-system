package com.clarivate.reviewservice.dto.Response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewHistoryResponse {
    private Long historyId;
    private String action;
    private Long performedBy;
    private String remarks;
    private LocalDateTime actionDate;
}
