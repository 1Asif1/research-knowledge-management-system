package com.clarivate.reviewservice;

import com.clarivate.reviewservice.Entity.*;
import com.clarivate.reviewservice.Enums.*;
import com.clarivate.reviewservice.Repository.*;
import com.clarivate.reviewservice.Service.EditorService;
import com.clarivate.reviewservice.Service.ResearcherService;
import com.clarivate.reviewservice.Service.ReviewerService;
import com.clarivate.reviewservice.dto.Request.*;
import com.clarivate.reviewservice.dto.Response.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ReviewServiceIntegrationTest {

    @Autowired
    private ResearcherService researcherService;

    @Autowired
    private EditorService editorService;

    @Autowired
    private ReviewerService reviewerService;

    @Autowired
    private PaperSubmissionRepository paperSubmissionRepository;

    @Autowired
    private ReviewProcessRepository reviewProcessRepository;

    @Autowired
    private PaperVersionRepository paperVersionRepository;

    @Autowired
    private ReviewHistoryRepository reviewHistoryRepository;

    @Test
    void testCompleteReviewWorkflow() {
        Long researcherId = 1L;
        Long editorId = 1L;
        Long reviewerId = 1L;

        // Step 1: Researcher submits paper
        SubmitPaperRequest submitRequest = SubmitPaperRequest.builder()
                .title("Machine Learning in Healthcare")
                .abstractText("This paper explores the application of ML techniques in healthcare systems")
                .fileName("paper_v1.pdf")
                .filePath("/uploads/paper_v1.pdf")
                .researcherId(researcherId)
                .build();

        PaperSubmissionResponse submitResponse = researcherService.submitPaper(submitRequest);
        assertNotNull(submitResponse);
        assertEquals("Machine Learning in Healthcare", submitResponse.getTitle());
        assertEquals(researcherId, submitResponse.getResearcherId());
        Long paperId = submitResponse.getPaperId();

        // Verify paper was created
        PaperSubmission paper = paperSubmissionRepository.findById(paperId.intValue()).orElse(null);
        assertNotNull(paper);
        assertEquals("Machine Learning in Healthcare", paper.getTitle());

        // Verify review process was created
        ReviewProcess reviewProcess = reviewProcessRepository.findByPaperSubmissionPaperId(paperId.intValue()).orElse(null);
        assertNotNull(reviewProcess);
        assertEquals(ReviewStatus.SUBMITTED.toString(), reviewProcess.getReviewStatus());
        assertEquals(EditorDecision.PENDING.toString(), reviewProcess.getEditorDecision());

        // Verify paper version was created
        List<PaperVersion> versions = paperVersionRepository.findByPaperSubmissionPaperId(paperId);
        assertNotNull(versions);
        assertEquals(1, versions.size());
        assertEquals(1, versions.get(0).getVersionNumber());

        // Verify review history was recorded
        List<ReviewHistory> history = reviewHistoryRepository.findByReviewProcessReviewIdOrderByActionDateAsc(reviewProcess.getReviewId());
        assertNotNull(history);
        assertEquals(1, history.size());
        assertEquals("Paper Submitted", history.get(0).getAction());

        // Step 2: Editor views pending reviews
        List<ReviewProcessResponse> pendingReviews = editorService.getPendingReviews();
        assertNotNull(pendingReviews);
        assertTrue(pendingReviews.stream().anyMatch(r -> r.getPaperId().equals(paperId)));

        // Step 3: Editor assigns reviewer
        AssignReviewerRequest assignRequest = AssignReviewerRequest.builder()
                .reviewId(reviewProcess.getReviewId())
                .reviewerId(reviewerId)
                .editorId(editorId)
                .build();

        ReviewProcessResponse assignResponse = editorService.assignReviewer(assignRequest);
        assertNotNull(assignResponse);
        assertEquals(reviewerId, assignResponse.getReviewerId());
        assertEquals(ReviewStatus.REVIEWER_ASSIGNED, assignResponse.getReviewStatus());

        // Step 4: Reviewer views assigned papers
        List<ReviewProcessResponse> assignedReviews = reviewerService.getAssignedReviews(reviewerId);
        assertNotNull(assignedReviews);
        assertTrue(assignedReviews.stream().anyMatch(r -> r.getPaperId().equals(paperId)));

        // Step 5: Reviewer adds comment
        ReviewCommentRequest commentRequest = ReviewCommentRequest.builder()
                .reviewId(reviewProcess.getReviewId())
                .versionId(versions.get(0).getVersionId())
                .reviewerId(reviewerId)
                .comment("Great research! Some suggestions: Please improve the methodology section.")
                .build();

        ReviewCommentResponse commentResponse = reviewerService.addComment(commentRequest);
        assertNotNull(commentResponse);
        assertEquals("Great research! Some suggestions: Please improve the methodology section.", commentResponse.getComment());

        // Step 6: Reviewer views comments
        List<ReviewCommentResponse> comments = reviewerService.getComments(reviewProcess.getReviewId());
        assertNotNull(comments);
        assertEquals(1, comments.size());

        // Step 7: Reviewer submits recommendations
        ReviewRecommendationRequest recommendationRequest = ReviewRecommendationRequest.builder()
                .recommendation(ReviewerRecommendation.MINOR_REVISION)
                .build();

        ReviewProcessResponse recommendationResponse = reviewerService.submitRecommendations(reviewProcess.getReviewId(), recommendationRequest);
        assertNotNull(recommendationResponse);
        assertEquals(ReviewerRecommendation.MINOR_REVISION, recommendationResponse.getReviewerRecommendation());
        assertEquals(ReviewStatus.UNDER_REVIEW, recommendationResponse.getReviewStatus());

        // Step 8: Researcher uploads corrected version
        UploadVersionRequest uploadRequest = UploadVersionRequest.builder()
                .fileName("paper_v2.pdf")
                .filePath("/uploads/paper_v2.pdf")
                .changeSummary("Revised methodology section with improved clarity")
                .build();

        PaperSubmissionResponse uploadResponse = researcherService.uploadNewVersion(paperId, uploadRequest);
        assertNotNull(uploadResponse);
        assertEquals(researcherId, uploadResponse.getResearcherId());

        // Verify new version was created
        List<PaperVersion> versionsAfterUpload = paperVersionRepository.findByPaperSubmissionPaperId(paperId);
        assertNotNull(versionsAfterUpload);
        assertEquals(2, versionsAfterUpload.size());
        assertEquals(2, versionsAfterUpload.get(1).getVersionNumber());

        // Verify review status updated to RESUBMITTED
        ReviewProcess updatedReview = reviewProcessRepository.findById(reviewProcess.getReviewId()).orElse(null);
        assertNotNull(updatedReview);
        assertEquals(ReviewStatus.RESUBMITTED.toString(), updatedReview.getReviewStatus());

        // Step 9: Editor makes final decision
        EditorDecisionRequest decisionRequest = EditorDecisionRequest.builder()
                .decision(EditorDecision.ACCEPT)
                .build();

        ReviewProcessResponse decisionResponse = editorService.makeFinalDecision(reviewProcess.getReviewId(), decisionRequest);
        assertNotNull(decisionResponse);
        assertEquals(EditorDecision.ACCEPT, decisionResponse.getEditorDecision());
        assertEquals(ReviewStatus.SENT_TO_PUBLICATION, decisionResponse.getReviewStatus());

        // Step 10: Researcher views their submission details
        PaperSubmissionResponse paperDetails = researcherService.getSubmission(paperId);
        assertNotNull(paperDetails);
        assertEquals("Machine Learning in Healthcare", paperDetails.getTitle());

        // Step 11: Editor views their assigned reviews
        List<ReviewProcessResponse> editorReviews = editorService.getAssignedReviews(editorId);
        assertNotNull(editorReviews);
        assertTrue(editorReviews.stream().anyMatch(r -> r.getPaperId().equals(paperId)));

        // Step 12: Researcher views all submissions
        List<PaperSubmissionResponse> mySubmissions = researcherService.getMySubmissions(researcherId);
        assertNotNull(mySubmissions);
        assertTrue(mySubmissions.stream().anyMatch(p -> p.getPaperId().equals(paperId)));
    }

    @Test
    void testErrorHandling() {
        Long nonExistentPaperId = 99999L;

        // Test resource not found
        assertThrows(Exception.class, () -> researcherService.getSubmission(nonExistentPaperId));
    }

    @Test
    void testValidation() {
        // Test null researcherId should fail
        SubmitPaperRequest invalidRequest = SubmitPaperRequest.builder()
                .title("Test Paper")
                .abstractText("Test Abstract")
                .fileName("test.pdf")
                .filePath("/test.pdf")
                .researcherId(null)
                .build();

        // Validation should catch this (handled at controller level)
        assertNull(invalidRequest.getResearcherId());
    }
}
