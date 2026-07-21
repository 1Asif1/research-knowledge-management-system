package com.clarivate.reviewservice.Service;

import com.clarivate.reviewservice.dto.Request.AssignReviewerRequest;
import com.clarivate.reviewservice.dto.Request.SubmitPaperRequest;
import com.clarivate.reviewservice.dto.Request.UploadVersionRequest;
import com.clarivate.reviewservice.dto.Response.PaperSubmissionResponse;
import com.clarivate.reviewservice.dto.Response.ReviewerAssignmentResponse;

import java.util.List;

public interface ResearcherService {
    PaperSubmissionResponse submitPaper(SubmitPaperRequest request);
    PaperSubmissionResponse uploadNewVersion(Long paperId, UploadVersionRequest request);
    List<PaperSubmissionResponse> getMySubmissions(Long researcherId);
    PaperSubmissionResponse getSubmission(Long paperId);
}
