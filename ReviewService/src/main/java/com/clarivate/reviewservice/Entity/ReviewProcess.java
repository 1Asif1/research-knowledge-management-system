package com.clarivate.reviewservice.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="review_process")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewProcess {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long reviewId;

    @Column(name = "paper_id", nullable = false, unique = true)
    private long paperId;

    @Column(nullable = false)
    private long editorId;

    @Column(nullable = false)
    private long assignedReviewerId;

    @Column(nullable = false)
    private int currentVersion;

    @Column(nullable = false)
    private String reviewStatus;

    private String reviewRecommendation;

    private String editorDecision;

    private LocalDateTime lastUpdated;
}
