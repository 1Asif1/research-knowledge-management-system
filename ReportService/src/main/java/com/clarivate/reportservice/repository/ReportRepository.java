package com.clarivate.reportservice.repository;

import com.clarivate.reportservice.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface ReportRepository extends JpaRepository<Report, Long> {
    long countByGeneratedDateBetween(LocalDateTime start, LocalDateTime end);
    long countByReportTypeAndGeneratedDateBetween(String reportType, LocalDateTime start, LocalDateTime end);
}

