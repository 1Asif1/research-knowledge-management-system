package com.clarivate.paperservice.Service.Interface;

import com.clarivate.paperservice.Dto.Request.PaperRequest;
import com.clarivate.paperservice.Dto.Request.ResearcherSubmitPaperRequest;
import com.clarivate.paperservice.Dto.Request.ResearcherUploadVersionRequest;
import com.clarivate.paperservice.Dto.Request.UpdatePaperRequest;
import com.clarivate.paperservice.Dto.Response.PaperDownloadResponse;
import com.clarivate.paperservice.Dto.Response.PaperResponse;
import com.clarivate.paperservice.Dto.Response.ReviewCommentResponse;
import com.clarivate.paperservice.Dto.Response.ResearcherPaperResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


public interface PaperService {
    PaperResponse SubmitPaper(PaperRequest paperRequest);

    PaperResponse updatePaper(Long id, UpdatePaperRequest paperRequest);

    Page<PaperResponse> search(String keyword, Pageable pageable);

    void changeStatus(Long id, String status);

    void deletePaper(Long id);

    PaperResponse getPaperById(Long paperId);

    ResearcherPaperResponse submitResearcherPaper(
            String title,
            String abstractText,
            Long researcherId,
            MultipartFile file);

    ResearcherPaperResponse submitResearcherPaper(ResearcherSubmitPaperRequest request);

    ResearcherPaperResponse uploadResearcherVersion(
            Long paperId,
            MultipartFile file,
            String changeSummary);

    ResearcherPaperResponse uploadResearcherVersion(
            Long paperId,
            ResearcherUploadVersionRequest request);

    List<ResearcherPaperResponse> getMySubmissions(Long researcherId);

    ResearcherPaperResponse getResearcherSubmission(Long paperId);

    PaperDownloadResponse downloadCurrentPaperVersion(Long paperId);

    List<ReviewCommentResponse> getResearcherReviewComments(Long paperId);
}
