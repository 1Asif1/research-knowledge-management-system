package com.clarivate.reviewservice.Repository;

import com.clarivate.reviewservice.Entity.ReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewCommentRepository extends JpaRepository<ReviewComment, Long> {
    List<ReviewComment> findByReviewProcessReviewId(Long reviewId);
    List<ReviewComment> findByPaperVersionId(Long versionId);
}
