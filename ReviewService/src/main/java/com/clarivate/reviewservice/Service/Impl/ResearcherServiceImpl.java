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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ResearcherServiceImpl implements ResearcherService {
    private final PaperSubmissionRepository paperSubmissionRepository;
    private final ReviewProcessRepository reviewProcessRepository;
    private final PaperVersionRepository paperVersionRepository;
    private final ReviewHistoryRepository reviewHistoryRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${user-service.url:http://localhost:8081}")
    private String userServiceUrl;

    @Value("${notification-service.url:http://localhost:8084}")
    private String notificationServiceUrl;

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
        reviewProcess = reviewProcessRepository.save(reviewProcess);

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

        notifyEditorsOfPaperSubmission(paper);

        return mapToResponse(paper);
    }

    @Override
    public PaperSubmissionResponse uploadNewVersion(Long paperId, UploadVersionRequest request) {
        PaperSubmission paper = paperSubmissionRepository.findById(paperId.intValue())
                .orElseThrow(() -> new EntityNotFoundException("Paper not found with id: " + paperId));

        PaperVersion latestVersion = paperVersionRepository
                .findTopByPaperSubmissionPaperIdOrderByVersionNumberDesc(paperId);

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
                .findByPaperId(paperId)
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

        notifyEditorOfRevision(reviewProcess, paper, nextVersionNumber);

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
        ReviewProcess reviewProcess = reviewProcessRepository.findByPaperId(paper.getPaperId())
                .orElse(null);

        return PaperSubmissionResponse.builder()
                .paperId(paper.getPaperId())
                .reviewId(reviewProcess != null ? reviewProcess.getReviewId() : null)
                .title(paper.getTitle())
                .researcherId(paper.getResearcherId())
                .submittedDate(paper.getSubmittedDate())
                .reviewStatus(reviewProcess != null ? reviewProcess.getReviewStatus() : null)
                .currentVersion(reviewProcess != null ? reviewProcess.getCurrentVersion() : null)
                .build();
    }

    private void notifyEditorsOfPaperSubmission(PaperSubmission paper) {
        List<Long> editorIds = fetchEditorUserIds();

        if (editorIds.isEmpty()) {
            log.warn(
                    "PAPER_SUBMITTED notification skipped: no EDITOR users resolved for paper {}",
                    paper.getPaperId()
            );
            return;
        }

        String title = "New Paper Submitted";
        String message = "A researcher submitted \""
                + paper.getTitle()
                + "\" for editorial review.";

        for (Long editorId : editorIds) {
            sendNotification(editorId, title, message, "PAPER_SUBMITTED");
        }
    }

    private void notifyEditorOfRevision(
            ReviewProcess reviewProcess,
            PaperSubmission paper,
            int versionNumber
    ) {
        long editorId = reviewProcess.getEditorId();

        if (editorId <= 0) {
            log.warn(
                    "REVISION_REQUESTED notification skipped: review {} has no assigned editorId",
                    reviewProcess.getReviewId()
            );
            return;
        }

        sendNotification(
                editorId,
                "Paper Revision Submitted",
                "The researcher uploaded version "
                        + versionNumber
                        + " of \""
                        + paper.getTitle()
                        + "\" for re-review.",
                "REVISION_REQUESTED"
        );
    }

    private List<Long> fetchEditorUserIds() {
        try {
            ResponseEntity<UserDirectoryEntry[]> response =
                    restTemplate.getForEntity(
                            userServiceUrl + "/users",
                            UserDirectoryEntry[].class
                    );

            UserDirectoryEntry[] users = response.getBody();
            if (users == null) {
                return Collections.emptyList();
            }

            return Arrays.stream(users)
                    .filter(u -> u.role != null
                            && "EDITOR".equalsIgnoreCase(u.role))
                    .map(u -> u.id)
                    .filter(id -> id != null && id > 0)
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            log.warn("Failed to fetch editors from user-service", ex);
            return Collections.emptyList();
        }
    }

    private void sendNotification(
            Long userId,
            String title,
            String message,
            String type
    ) {
        Map<String, Object> body = new HashMap<>();

        body.put("userId", userId);
        body.put("title", title);
        body.put("message", message);
        body.put("type", type);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(
                    notificationServiceUrl + "/notifications",
                    request,
                    Object.class
            );

            log.info(
                    "Editor notification created for editorId={}, type={}",
                    userId,
                    type
            );
        } catch (Exception ex) {
            log.warn(
                    "Failed to create editor notification for editorId={}, type={}",
                    userId,
                    type,
                    ex
            );
        }
    }

    private static final class UserDirectoryEntry {
        public Long id;
        public String firstName;
        public String lastName;
        public String role;
    }
}
