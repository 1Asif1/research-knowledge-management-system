package com.clarivate.reportservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    @Column(nullable = false, length = 100)
    private String reportType;

    @Column(nullable = false)
    private LocalDateTime generatedDate;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Long authorId;

    @Column(nullable = false)
    private String paperStatus;

    @Column(columnDefinition = "TEXT")
    private String payload;
}

