package com.clarivate.reportservice.service;

import com.clarivate.reportservice.dto.AnnualReportSummaryResponse;
import com.clarivate.reportservice.dto.PublicationReportRequest;
import com.clarivate.reportservice.dto.ReportResponse;
import com.clarivate.reportservice.entity.Report;
import com.clarivate.reportservice.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Month;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private static final String PUBLICATION_REPORT_TYPE = "PUBLICATION";
    private final ReportRepository reportRepository;

    @Override
    public ReportResponse createPublicationReport(PublicationReportRequest request) {
        Report report = new Report();
        report.setReportType(PUBLICATION_REPORT_TYPE);
        report.setGeneratedDate(LocalDateTime.now());
        report.setTitle(request.title());
        report.setAuthorId(request.authorId());
        report.setPaperStatus(request.status());
        report.setPayload(request.payload());

        Report saved = reportRepository.save(report);
        return toResponse(saved);
    }

    @Override
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AnnualReportSummaryResponse getAnnualSummary(int year) {
        LocalDateTime start = LocalDateTime.of(year, Month.JANUARY, 1, 0, 0);
        LocalDateTime end = start.plusYears(1);
        long total = reportRepository.countByGeneratedDateBetween(start, end);
        long publication = reportRepository.countByReportTypeAndGeneratedDateBetween(PUBLICATION_REPORT_TYPE, start, end);
        return new AnnualReportSummaryResponse(year, total, publication);
    }

    private ReportResponse toResponse(Report report) {
        return new ReportResponse(
                report.getReportId(),
                report.getReportType(),
                report.getGeneratedDate(),
                report.getTitle(),
                report.getAuthorId(),
                report.getPaperStatus(),
                report.getPayload()
        );
    }
}

