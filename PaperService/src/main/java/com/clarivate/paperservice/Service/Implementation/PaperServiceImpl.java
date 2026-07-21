package com.clarivate.paperservice.Service.Implementation;

import com.clarivate.paperservice.Dto.Request.PaperRequest;
import com.clarivate.paperservice.Dto.Request.UpdatePaperRequest;
import com.clarivate.paperservice.Dto.Response.PaperResponse;
import com.clarivate.paperservice.Entity.Paper;
import com.clarivate.paperservice.Repository.PaperRepository;
import com.clarivate.paperservice.Service.Interface.PaperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import com.clarivate.paperservice.Enum.PaperStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class PaperServiceImpl implements PaperService {

    @Autowired
    private PaperRepository paperRepository;

    @Override
    public PaperResponse SubmitPaper(PaperRequest paperRequest) {
        Paper paper = new Paper(paperRequest);
        paperRepository.save(paper);
        return new PaperResponse(paper);
    }
    @Override
    public PaperResponse getPaperById(Long id) {
        return paperRepository.findById(id)
                .map(PaperResponse::new)
                .orElseThrow(() -> new RuntimeException("Paper not found"));
    }

    @Override
    public PaperResponse updatePaper(Long id, @org.jetbrains.annotations.UnknownNullability UpdatePaperRequest paperRequest) {
        Paper paper = paperRepository.findById(id).orElseThrow(() -> new RuntimeException("Paper not found"));
        paper.setTitle(paperRequest.getTitle());
        paper.setDescription(paperRequest.getDescription());
        paper.setAuthorId(paperRequest.getAuthorId());
        paper.setStatus(PaperStatus.valueOf(paperRequest.getStatus()));
        paperRepository.save(paper);
        return new PaperResponse(paper);
    }

    @Override
    public Page<PaperResponse> search(String keyword, Pageable pageable) {
        return paperRepository.findByTitleContainingIgnoreCase(keyword, pageable).map(PaperResponse::new);
    }

    @Override
    public void changeStatus(Long id, String status) {
        Paper paper = paperRepository.findById(id).orElseThrow(() -> new RuntimeException("Paper not found"));
        paper.setStatus(PaperStatus.valueOf(status));
        paperRepository.save(paper);
    }

    @Override
    public void deletePaper(Long id) {
        paperRepository.deleteById(id);
    }
}
