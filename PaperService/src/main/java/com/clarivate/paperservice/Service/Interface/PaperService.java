package com.clarivate.paperservice.Service.Interface;

import com.clarivate.paperservice.Dto.Request.PaperRequest;
import com.clarivate.paperservice.Dto.Request.UpdatePaperRequest;
import com.clarivate.paperservice.Dto.Response.PaperResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface PaperService {
    PaperResponse SubmitPaper(PaperRequest paperRequest);

    PaperResponse updatePaper(Long id, UpdatePaperRequest paperRequest);

    Page<PaperResponse> search(String keyword, Pageable pageable);

    void changeStatus(Long id, String status);

    void deletePaper(Long id);

    PaperResponse getPaperById(Long paperId);
}
