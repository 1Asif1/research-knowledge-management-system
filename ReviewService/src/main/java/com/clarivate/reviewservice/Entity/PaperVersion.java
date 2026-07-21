package com.clarivate.reviewservice.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name= "paper_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaperVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long versionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name= "paper_id", nullable=false)
    private PaperSubmission paperSubmission;

    @Column(nullable = false)
    private int versionNumber;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath;

    @Column(length = 10000)
    private String changeSummary;

    @Column(nullable = false)
    private String uploadedBy;

    private LocalDateTime uploadedDate;

}
