package com.clarivate.reviewservice.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.Id;

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

    @OneToOne
    @JoinColumn(name = "paper_id", nullable = false)
    private long paperId;

    private long editorId;
    private long assignedReviewerId;

    @Column(nullable = false)
    private int currentVersion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private String reviewStatus;

    @Enumerated(EnumType.STRING)
    private String reviewRecommendation;

    @Enumerated(EnumType.STRING)
    private String editorDecision;

    private LocalDateTime lastUpdated;
}
