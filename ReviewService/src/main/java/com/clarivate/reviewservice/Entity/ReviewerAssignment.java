package com.clarivate.reviewservice.Entity;

import com.clarivate.reviewservice.Enums.AssignmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="reviewer_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewerAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long assignmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name= "review_id", nullable=false)
    private ReviewProcess reviewProcess;

    @Column(nullable=false)
    private long reviewerId;

    @Column(nullable=false)
    private long assignedByEditorId;

    @Column(nullable=false)
    private LocalDateTime assignedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private AssignmentStatus assignmentStatus;

}
