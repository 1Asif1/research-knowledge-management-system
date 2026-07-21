package com.clarivate.reviewservice.Repository;

import com.clarivate.reviewservice.Entity.ReviewerAssignment;
import com.clarivate.reviewservice.Enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewerAssignmentRepository extends JpaRepository<ReviewerAssignment, Long> {
    List<ReviewerAssignment> findByReviewerId(Long reviewerId);
    List<ReviewerAssignment> findByAssignmentStatus(AssignmentStatus assignmentStatus);
    List<ReviewerAssignment> findByReviewProcessReviewId(Long reviewId);
}
