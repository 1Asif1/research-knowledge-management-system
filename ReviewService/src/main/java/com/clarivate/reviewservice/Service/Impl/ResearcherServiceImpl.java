package com.clarivate.reviewservice.Service.Impl;

import com.clarivate.reviewservice.dto.Request.SubmitPaperRequest;
import com.clarivate.reviewservice.dto.Request.UploadVersionRequest;
import com.clarivate.reviewservice.dto.Response.PaperSubmissionResponse;
import com.clarivate.reviewservice.Entity.PaperSubmission;
import com.clarivate.reviewservice.Entity.PaperVersion;
import com.clarivate.reviewservice.Entity.ReviewHistory;
import com.clarivate.reviewservice.Entity.ReviewProcess;
import com.clarivate.reviewservice.Enums.EditorDecision;
import com.clarivate.reviewservice.Enums.ReviewStatus;
import com.clarivate.reviewservice.Repository.PaperSubmissionRepository;
import com.clarivate.reviewservice.Repository.PaperVersionRepository;
import com.clarivate.reviewservice.Repository.ReviewHistoryRepository;
import com.clarivate.reviewservice.Repository.ReviewProcessRepository;
import com.clarivate.reviewservice.Service.ResearcherService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ResearcherServiceImpl implements ResearcherService {
    private final PaperSubmissionRepository paperSubmissionRepository;
    private final ReviewProcessRepository reviewProcessRepository;
    private final PaperVersionRepository paperVersionRepository;
    private final ReviewHistoryRepository reviewHistoryRepository;

    @Override
    public PaperSubmissionResponse submitPaper(SubmitPaperRequest request) {
        PaperSubmission paper = PaperSubmission.builder()
                .title(request.getTitle())
                .abstractTest(request.getAbstractText())
                .fileName(request.getFileName())
                .filePath(request.getFilePath())
                .researcherId(request.getResearcherId())
                .submittedDate(LocalDateTime.now())
                .build();
        paper = paperSubmissionRepository.save(paper);

        ReviewProcess reviewProcess = ReviewProcess.builder()
                .paperId(paper.getPaperId())
                .currentVersion(1)
                .reviewStatus(ReviewStatus.SUBMITTED.toString())
                .editorDecision(EditorDecision.PENDING.toString())
                .lastUpdated(LocalDateTime.now())
                .build();
        reviewProcessRepository.save(reviewProcess);

        PaperVersion version = PaperVersion.builder()
                .paperSubmission(paper)
                .versionNumber(1)
                .fileName(request.getFileName())
                .filePath(request.getFilePath())
                .uploadedBy(request.getResearcherId().toString())
                .uploadedDate(LocalDateTime.now())
                .build();
        paperVersionRepository.save(version);

        ReviewHistory history = ReviewHistory.builder()
                .reviewProcess(reviewProcess)
                .action("Paper Submitted")
                .performedBy(request.getResearcherId().toString())
                .remarks("Initial Submission")
                .actionDate(LocalDateTime.now())
                .build();
        reviewHistoryRepository.save(history);

        return mapToResponse(paper);
    }

    @Override
    public PaperSubmissionResponse uploadNewVersion(Long paperId, UploadVersionRequest request) {
        PaperSubmission paper = paperSubmissionRepository.findById(paperId.intValue())
                .orElseThrow(() -> new EntityNotFoundException("Paper not found with id: " + paperId));

        PaperVersion latestVersion = paperVersionRepository
                .findTopByPaperSubmissionPaperIdOrderByVersionDesc(paperId);

        int nextVersionNumber = (latestVersion != null) ? latestVersion.getVersionNumber() + 1 : 2;

        PaperVersion newVersion = PaperVersion.builder()
                .paperSubmission(paper)
                .versionNumber(nextVersionNumber)
                .fileName(request.getFileName())
                .filePath(request.getFilePath())
                .changeSummary(request.getChangeSummary())
                .uploadedBy(String.valueOf(paper.getResearcherId()))
                .uploadedDate(LocalDateTime.now())
                .build();
        paperVersionRepository.save(newVersion);

        ReviewProcess reviewProcess = reviewProcessRepository
                .findByPaperSubmissionPaperId(paperId.intValue())
                .orElseThrow(() -> new EntityNotFoundException("Review process not found for paper: " + paperId));

        reviewProcess.setCurrentVersion(nextVersionNumber);
        reviewProcess.setReviewStatus(ReviewStatus.RESUBMITTED.toString());
        reviewProcess.setLastUpdated(LocalDateTime.now());
        reviewProcessRepository.save(reviewProcess);

        ReviewHistory history = ReviewHistory.builder()
                .reviewProcess(reviewProcess)
                .action("New Version Uploaded")
                .performedBy(String.valueOf(paper.getResearcherId()))
                .remarks("Version " + nextVersionNumber + " uploaded")
                .actionDate(LocalDateTime.now())
                .build();
        reviewHistoryRepository.save(history);

        return mapToResponse(paper);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaperSubmissionResponse> getMySubmissions(Long researcherId) {
        return paperSubmissionRepository.findByResearcherId(researcherId.intValue())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PaperSubmissionResponse getSubmission(Long paperId) {
        PaperSubmission paper = paperSubmissionRepository.findById(paperId.intValue())
                .orElseThrow(() -> new EntityNotFoundException("Paper not found with id: " + paperId));

        return mapToResponse(paper);
    }

    private PaperSubmissionResponse mapToResponse(PaperSubmission paper) {
        return PaperSubmissionResponse.builder()
                .paperId(paper.getPaperId())
                .title(paper.getTitle())
                .researcherId(paper.getResearcherId())
                .submittedDate(paper.getSubmittedDate())
                .build();
    }
}
