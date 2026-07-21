package com.clarivate.reviewservice.dto.Response;

import com.clarivate.reviewservice.Enums.AssignmentStatus;

import java.time.LocalDateTime;

public class ReviewerAssignmentResponse {
    private Long assignmentId;
    private Long reviewerId;
    private Long assignedByEditorId;
    private AssignmentStatus assignmentStatus;
    private LocalDateTime assignedDate;
}
