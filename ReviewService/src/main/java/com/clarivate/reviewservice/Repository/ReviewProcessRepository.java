package com.clarivate.reviewservice.Repository;

import com.clarivate.reviewservice.Entity.ReviewProcess;
import com.clarivate.reviewservice.Enums.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewProcessRepository extends JpaRepository<ReviewProcess, Long> {
    Optional<ReviewProcess> findByPaperSubmissionPaperId(Integer paperId);
    List<ReviewProcess> findByReviewStatus(ReviewStatus reviewStatus);
    List<ReviewProcess> findByCurrentReviewerId(Long reviewerId);
    List<ReviewProcess> findByEditorId(Long editorId);
}
