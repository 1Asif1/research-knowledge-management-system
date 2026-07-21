package com.clarivate.reviewservice.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name ="paper_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaperSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long paperId;

    @Column(nullable = false)
    private String title;
    @Column(nullable = false, length = 5000)
    private String abstractTest;
    @Column(nullable = false)
    private String fileName;
    @Column(nullable = false)
    private String filePath;
    @Column(nullable = false)
    private long researcherId;
    @Column(nullable = false)
    private LocalDateTime submittedDate;
}
