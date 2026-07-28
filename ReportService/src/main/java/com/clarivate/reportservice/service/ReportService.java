package com.clarivate.reportservice.service;

import com.clarivate.reportservice.dto.AnnualReportSummaryResponse;
import com.clarivate.reportservice.dto.PublicationReportRequest;
import com.clarivate.reportservice.dto.ReportResponse;

import java.util.List;

public interface ReportService {
    ReportResponse createPublicationReport(PublicationReportRequest request);
    List<ReportResponse> getAllReports();
    AnnualReportSummaryResponse getAnnualSummary(int year);
}

