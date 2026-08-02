package com.clarivate.reportservice.service;

import com.clarivate.reportservice.dto.PublishedPaperReportResponse;
import com.clarivate.reportservice.dto.PublishedPaperSummaryResponse;

import java.util.List;

public interface PublishedPaperReportService {
    List<PublishedPaperSummaryResponse> getPublishedPapers();
    PublishedPaperReportResponse getPublishedPaperReport(Long paperId);
    byte[] generatePublishedPaperPdf(Long paperId);
}
