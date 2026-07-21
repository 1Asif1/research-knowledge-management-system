package com.clarivate.reviewservice.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;

@Entity
@Table(name="review_comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="review_id", nullable=false)
    private ReviewProcess reviewProcess;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name= "version_id", nullable=false)
    private PaperVersion paperVersion;

    @Column(nullable = false)
    private long reviewId;

    @Column(nullable = false, length = 10000)
    private String comment;

    private LocalDateTime createdDate;
}
