package com.clarivate.reviewservice.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;

@Entity
@Table(name="review_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long historyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private ReviewProcess reviewProcess;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String performedBy;

    @Column(nullable = false)
    private String remarks;

    @Column(nullable = false)
    private LocalDateTime actionDate;
}
