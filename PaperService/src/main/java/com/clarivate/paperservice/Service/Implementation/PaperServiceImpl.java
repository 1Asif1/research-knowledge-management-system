package com.clarivate.paperservice.Service.Implementation;

import com.clarivate.paperservice.Client.NotificationServiceClient;
import com.clarivate.paperservice.Client.ReviewServiceClient;
import com.clarivate.paperservice.Client.UserServiceClient;
import com.clarivate.paperservice.Dto.Request.NotificationCreateRequest;
import com.clarivate.paperservice.Dto.Request.PaperRequest;
import com.clarivate.paperservice.Dto.Request.ResearcherSubmitPaperRequest;
import com.clarivate.paperservice.Dto.Request.ResearcherUploadVersionRequest;
import com.clarivate.paperservice.Dto.Request.ReviewSubmitPaperRequest;
import com.clarivate.paperservice.Dto.Request.ReviewUploadVersionRequest;
import com.clarivate.paperservice.Dto.Request.UpdatePaperRequest;
import com.clarivate.paperservice.Dto.Response.PaperDownloadResponse;
import com.clarivate.paperservice.Dto.Response.PaperResponse;
import com.clarivate.paperservice.Dto.Response.ReviewCommentResponse;
import com.clarivate.paperservice.Dto.Response.ResearcherPaperResponse;
import com.clarivate.paperservice.Dto.Response.ReviewPaperSubmissionResponse;
import com.clarivate.paperservice.Entity.Paper;
import com.clarivate.paperservice.Entity.PaperVersion;
import com.clarivate.paperservice.Enum.PaperStatus;
import com.clarivate.paperservice.Exception.IntegrationException;
import com.clarivate.paperservice.Exception.ResourceNotFoundException;
import com.clarivate.paperservice.Repository.PaperRepository;
import com.clarivate.paperservice.Repository.PaperVersionRepository;
import com.clarivate.paperservice.Service.Interface.FileStorageService;
import com.clarivate.paperservice.Service.Interface.PaperService;
import com.clarivate.paperservice.Util.FileUtil;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaperServiceImpl implements PaperService {
    private static final String REVIEW_SYNC_PENDING_STATUS = "SYNC_PENDING";

    private final PaperRepository paperRepository;
    private final PaperVersionRepository paperVersionRepository;
    private final FileStorageService fileStorageService;
    private final ReviewServiceClient reviewServiceClient;
    private final NotificationServiceClient notificationServiceClient;
    private final UserServiceClient userServiceClient;

    @Override
    public PaperResponse SubmitPaper(PaperRequest paperRequest) {
        Paper paper = new Paper(paperRequest);
        paper.setAuthor(resolveAuthorName(paper.getAuthorId(), paper.getAuthor()));
        paperRepository.save(paper);
        return toPaperResponse(paper);
    }

    @Override
    public PaperResponse getPaperById(Long id) {
        return findPaperForReviewerOrThrow(id)
                .map(this::toPaperResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found"));
    }

    @Override
    public PaperResponse updatePaper(Long id, UpdatePaperRequest paperRequest) {
        Paper paper = findPaperOrThrow(id);
        paper.setTitle(paperRequest.getTitle());
        paper.setDescription(paperRequest.getDescription());
        paperRepository.save(paper);
        return toPaperResponse(paper);
    }

    @Override
    public Page<PaperResponse> search(String keyword, Pageable pageable) {
        return paperRepository.findByTitleContainingIgnoreCase(keyword, pageable).map(this::toPaperResponse);
    }

    @Override
    public void changeStatus(Long id, String status) {
        Paper paper = findPaperForReviewerOrThrow(id)
                .orElseThrow(this::notFound);
        paper.setStatus(PaperStatus.valueOf(status));
        paperRepository.save(paper);
    }

    @Override
    public void deletePaper(Long id) {
        paperRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ResearcherPaperResponse submitResearcherPaper(
            String title,
            String abstractText,
            Long researcherId,
            MultipartFile file) {
        FileUtil.validatePdfFile(file);

        String storedFileName = storeFile(file);
        String storedFilePath = buildUploadPath(storedFileName);

        Paper paper = PaperFactory.newResearcherPaper(title, abstractText, researcherId, storedFileName, storedFilePath);
        paper = paperRepository.save(paper);

        createPaperVersion(paper, storedFileName, storedFilePath, "Initial Submission");

        ReviewPaperSubmissionResponse reviewResponse = null;
        try {
            reviewResponse = reviewServiceClient.submitPaper(
                    ReviewSubmitPaperRequest.builder()
                            .title(title)
                            .abstractText(abstractText)
                            .fileName(storedFileName)
                            .filePath(storedFilePath)
                            .researcherId(researcherId)
                            .build());
            paper.setReviewPaperId(reviewResponse.getPaperId());
            paperRepository.save(paper);
        } catch (FeignException ex) {
            log.warn("Review sync pending for paper {} after local submit", paper.getId(), ex);
        }

        sendSubmissionNotification(paper);
        return toResearcherPaperResponse(paper, reviewResponse);
    }

    @Override
    @Transactional
    public ResearcherPaperResponse submitResearcherPaper(ResearcherSubmitPaperRequest request) {
        String normalizedFileName = normalizeFileName(request.getFileName());
        Paper paper = PaperFactory.newResearcherPaper(
                request.getTitle(),
                request.getAbstractText(),
                request.getResearcherId(),
                normalizedFileName,
                request.getFilePath());
        paper = paperRepository.save(paper);

        createPaperVersion(paper, normalizedFileName, request.getFilePath(), "Initial Submission");

        ReviewPaperSubmissionResponse reviewResponse = null;
        try {
            reviewResponse = reviewServiceClient.submitPaper(
                    ReviewSubmitPaperRequest.builder()
                            .title(request.getTitle())
                            .abstractText(request.getAbstractText())
                            .fileName(normalizedFileName)
                            .filePath(request.getFilePath())
                            .researcherId(request.getResearcherId())
                            .build());
            paper.setReviewPaperId(reviewResponse.getPaperId());
            paperRepository.save(paper);
        } catch (FeignException ex) {
            log.warn("Review sync pending for paper {} after local submit", paper.getId(), ex);
        }

        sendSubmissionNotification(paper);
        return toResearcherPaperResponse(paper, reviewResponse);
    }

    @Override
    @Transactional
    public ResearcherPaperResponse uploadResearcherVersion(
            Long paperId,
            MultipartFile file,
            String changeSummary) {
        FileUtil.validatePdfFile(file);
        Paper paper = findPaperOrThrow(paperId);

        String storedFileName = storeFile(file);
        String storedFilePath = buildUploadPath(storedFileName);

        int versionNumber = createPaperVersion(
                paper,
                storedFileName,
                storedFilePath,
                changeSummary);

        try {
            ReviewPaperSubmissionResponse reviewResponse = syncVersion(
                    paper,
                    storedFileName,
                    storedFilePath,
                    changeSummary);
            sendRevisionNotification(paper, versionNumber);
            return toResearcherPaperResponse(paper, reviewResponse, versionNumber);
        } catch (FeignException ex) {
            throw withFileCleanup(
                    "Version uploaded but review workflow sync failed",
                    ex,
                    storedFileName);
        }
    }

    @Override
    @Transactional
    public ResearcherPaperResponse uploadResearcherVersion(
            Long paperId,
            ResearcherUploadVersionRequest request) {
        Paper paper = findPaperOrThrow(paperId);
        String normalizedFileName = normalizeFileName(request.getFileName());
        int versionNumber = createPaperVersion(
                paper,
                normalizedFileName,
                request.getFilePath(),
                request.getChangeSummary());

        try {
            ReviewPaperSubmissionResponse reviewResponse = syncVersion(
                    paper,
                    normalizedFileName,
                    request.getFilePath(),
                    request.getChangeSummary());
            sendRevisionNotification(paper, versionNumber);
            return toResearcherPaperResponse(paper, reviewResponse, versionNumber);
        } catch (FeignException ex) {
            throw new IntegrationException("Version uploaded but review workflow sync failed", ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResearcherPaperResponse> getMySubmissions(Long researcherId) {
        return paperRepository.findByAuthorId(researcherId)
                .stream()
                .map(this::toResearcherPaperResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResearcherPaperResponse getResearcherSubmission(Long paperId) {
        return toResearcherPaperResponse(findPaperOrThrow(paperId));
    }

    @Override
    @Transactional(readOnly = true)
    public PaperDownloadResponse downloadCurrentPaperVersion(Long paperId) {
        Paper paper = findPaperForReviewerOrThrow(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found"));
        Long localPaperId = paper.getId();
        PaperVersion latestVersion = paperVersionRepository.findTopByPaperIdOrderByVersionDesc(localPaperId);
        List<String> references = new ArrayList<>();
        if (latestVersion != null) {
            references.add(latestVersion.getFileName());
            references.add(latestVersion.getFilePath());
        }
        references.add(paper.getFileName());
        references.add(paper.getFilePath());

        String responseFileName = references.stream()
                .filter(this::hasText)
                .map(this::extractFileName)
                .filter(this::hasText)
                .findFirst()
                .orElse(null);

        if (responseFileName == null) {
            throw new ResourceNotFoundException("No paper file found for this submission");
        }

        for (String reference : references) {
            if (!hasText(reference)) {
                continue;
            }
            try {
                return new PaperDownloadResponse(
                        responseFileName,
                        fileStorageService.loadFile(reference));
            } catch (IOException ignored) {
                // Try next available file reference.
            }
        }

        throw new ResourceNotFoundException("Current paper file not found. Please upload the manuscript again.");
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewCommentResponse> getResearcherReviewComments(Long paperId) {
        Paper paper = findPaperOrThrow(paperId);
        if (paper.getReviewPaperId() == null) {
            return List.of();
        }

        try {
            return reviewServiceClient.getReviewComments(paper.getReviewPaperId());
        } catch (FeignException.NotFound ex) {
            return List.of();
        } catch (FeignException ex) {
            throw new IntegrationException("Unable to fetch review comments", ex);
        }
    }

    private void sendSubmissionNotification(Paper paper) {
        try {
            notificationServiceClient.sendNotification(
                    NotificationCreateRequest.builder()
                            .userId(paper.getAuthorId())
                            .title("Paper Submitted")
                            .message("Your paper \"" + paper.getTitle() + "\" was submitted successfully.")
                            .type("PAPER_SUBMITTED")
                            .build());
        } catch (FeignException ex) {
            log.warn("Notification pending for paper {}", paper.getId(), ex);
        }
    }

    private void sendRevisionNotification(Paper paper, int versionNumber) {
        try {
            notificationServiceClient.sendNotification(
                    NotificationCreateRequest.builder()
                            .userId(paper.getAuthorId())
                            .title("Revision Uploaded")
                            .message("Version " + versionNumber + " of \"" + paper.getTitle() + "\" was uploaded.")
                            .type("REVISION_REQUESTED")
                            .build());
        } catch (FeignException ex) {
            throw new IntegrationException("Version uploaded but notification creation failed", ex);
        }
    }

    private ReviewPaperSubmissionResponse syncVersion(
            Paper paper,
            String fileName,
            String filePath,
            String changeSummary) {
        if (paper.getReviewPaperId() == null) {
            throw new IntegrationException("Paper is not linked to review workflow", null);
        }

        return reviewServiceClient.uploadVersion(
                paper.getReviewPaperId(),
                ReviewUploadVersionRequest.builder()
                        .fileName(fileName)
                        .filePath(filePath)
                        .changeSummary(changeSummary)
                        .build());
    }

    private int createPaperVersion(
            Paper paper,
            String fileName,
            String filePath,
            String description) {
        int nextVersion = paperVersionRepository.findByPaperId(paper.getId())
                .stream()
                .map(PaperVersion::getVersion)
                .max(Integer::compareTo)
                .orElse(0) + 1;

        PaperVersion paperVersion = new PaperVersion();
        paperVersion.setPaper(paper);
        paperVersion.setVersion(nextVersion);
        paperVersion.setDescription(description);
        paperVersion.setFileName(fileName);
        paperVersion.setFilePath(filePath);
        paperVersionRepository.save(paperVersion);
        return nextVersion;
    }

    private ResearcherPaperResponse toResearcherPaperResponse(Paper paper) {
        if (paper.getReviewPaperId() == null) {
            return toResearcherPaperResponse(paper, null);
        }

        try {
            ReviewPaperSubmissionResponse reviewResponse = reviewServiceClient.getSubmission(paper.getReviewPaperId());
            return toResearcherPaperResponse(paper, reviewResponse);
        } catch (FeignException ex) {
            throw new IntegrationException("Unable to fetch review workflow status", ex);
        }
    }

    private ResearcherPaperResponse toResearcherPaperResponse(
            Paper paper,
            ReviewPaperSubmissionResponse reviewResponse) {
        return toResearcherPaperResponse(paper, reviewResponse, null);
    }

    private ResearcherPaperResponse toResearcherPaperResponse(
            Paper paper,
            ReviewPaperSubmissionResponse reviewResponse,
            Integer fallbackVersion) {
        return ResearcherPaperResponse.builder()
                .paperId(paper.getId())
                .reviewId(reviewResponse != null ? reviewResponse.getReviewId() : null)
                .title(paper.getTitle())
                .researcherId(paper.getAuthorId())
                .submittedDate(paper.getCreatedDate())
                .reviewStatus(resolveReviewStatus(paper, reviewResponse))
                .currentVersion(reviewResponse != null
                        ? reviewResponse.getCurrentVersion()
                        : (fallbackVersion != null ? fallbackVersion : 1))
                .build();
    }

    private String resolveReviewStatus(Paper paper, ReviewPaperSubmissionResponse reviewResponse) {
        if (reviewResponse != null && reviewResponse.getReviewStatus() != null) {
            return reviewResponse.getReviewStatus();
        }
        if (paper.getReviewPaperId() == null && paper.getStatus() == PaperStatus.SUBMITTED) {
            return REVIEW_SYNC_PENDING_STATUS;
        }
        return paper.getStatus().name();
    }

    private ResourceNotFoundException notFound() {
        return new ResourceNotFoundException("Paper not found");
    }

    private Paper findPaperOrThrow(Long paperId) {
        return paperRepository.findById(paperId).orElseThrow(this::notFound);
    }

    private java.util.Optional<Paper> findPaperForReviewerOrThrow(Long paperId) {
        return paperRepository.findById(paperId)
                .or(() -> paperRepository.findByReviewPaperId(paperId));
    }

    private String buildUploadPath(String storedFileName) {
        return "/uploads/" + storedFileName;
    }

    private String storeFile(MultipartFile file) {
        try {
            return fileStorageService.storeFile(file);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to store manuscript file", ex);
        }
    }

    private String normalizeFileName(String fileName) {
        if (!fileName.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }
        return fileName;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String extractFileName(String fileNameOrPath) {
        String normalized = fileNameOrPath.replace('\\', '/');
        int lastSlash = normalized.lastIndexOf('/');
        return lastSlash >= 0 && lastSlash < normalized.length() - 1
                ? normalized.substring(lastSlash + 1)
                : normalized;
    }

    private IntegrationException withFileCleanup(
            String message,
            FeignException cause,
            String storedFileName) {
        IntegrationException exception = new IntegrationException(message, cause);
        try {
            fileStorageService.deleteFile(storedFileName);
        } catch (IOException cleanupError) {
            exception.addSuppressed(cleanupError);
        }
        return exception;
    }

    private static final class PaperFactory {
        private PaperFactory() {
        }

        private static Paper newResearcherPaper(
                String title,
                String abstractText,
                Long researcherId,
                String fileName,
                String filePath) {
            Paper paper = new Paper();
            paper.setTitle(title);
            paper.setDescription(abstractText);
            paper.setAuthorId(researcherId);
            paper.setAuthor(null);
            paper.setStatus(PaperStatus.SUBMITTED);
            paper.setFileName(fileName);
            paper.setFilePath(filePath);
            return paper;
        }
    }

    private PaperResponse toPaperResponse(Paper paper) {
        String resolvedAuthor = resolveAuthorName(paper.getAuthorId(), paper.getAuthor());
        PaperResponse response = new PaperResponse(paper);
        response.setAuthorName(resolvedAuthor);
        return response;
    }

    private String resolveAuthorName(Long authorId, String existingValue) {
        if (authorId == null) {
            return existingValue != null ? existingValue : "Unknown User";
        }
        try {
            Object user = userServiceClient.getUserById(authorId);
            if (user instanceof Map<?, ?> userMap) {
                Object first = userMap.get("firstName");
                Object last = userMap.get("lastName");
                if (first instanceof String firstName && last instanceof String lastName) {
                    return (firstName + " " + lastName).trim();
                }
            }
        } catch (Exception ex) {
            log.warn("Unable to resolve author name for user {}", authorId);
        }

        if (existingValue != null && !existingValue.isBlank()) {
            return existingValue;
        }
        return "User #" + authorId;
    }
}
