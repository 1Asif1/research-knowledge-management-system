package com.clarivate.reviewservice.Repository;

import com.clarivate.reviewservice.Entity.ReviewHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewHistoryRepository extends JpaRepository<ReviewHistory, Long> {
    List<ReviewHistory> findByReviewProcessReviewIdOrderByActionDateAsc(Long reviewId);
}
