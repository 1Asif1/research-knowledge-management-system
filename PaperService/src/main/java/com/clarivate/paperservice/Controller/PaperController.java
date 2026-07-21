package com.clarivate.paperservice.Controller;


import com.clarivate.paperservice.Service.Interface.PaperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



import com.clarivate.paperservice.Dto.Request.PaperRequest;
import com.clarivate.paperservice.Dto.Request.UpdatePaperRequest;
import com.clarivate.paperservice.Dto.Response.PaperResponse;
import com.clarivate.paperservice.Service.Implementation.PaperServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/papers")
@RequiredArgsConstructor
public class PaperController {

    private final PaperService paperService;

    @PostMapping
    public ResponseEntity<PaperResponse> createPaper(
            @RequestBody PaperRequest request) {

        return ResponseEntity.ok(
                paperService.SubmitPaper(request));
    }

    @PutMapping("/{paperId}")
    public ResponseEntity<PaperResponse> updatePaper(
            @PathVariable Long paperId,
            @RequestBody UpdatePaperRequest request) {

        return ResponseEntity.ok(
                paperService.updatePaper(paperId, request));
    }

    @GetMapping("/{paperId}")
    public ResponseEntity<PaperResponse> getPaper(
            @PathVariable Long paperId) {

        return ResponseEntity.ok(
                paperService.getPaperById(paperId));
    }

    @DeleteMapping("/{paperId}")
    public ResponseEntity<String> deletePaper(
            @PathVariable Long paperId) {

        paperService.deletePaper(paperId);

        return ResponseEntity.ok("Paper deleted successfully");
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PaperResponse>> searchPapers(
            @RequestParam String keyword,
            Pageable pageable) {

        return ResponseEntity.ok(
                paperService.search(keyword, pageable));
    }

    @PatchMapping("/{paperId}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable Long paperId,
            @RequestParam String status) {

        paperService.changeStatus(
                paperId,
                status);

        return ResponseEntity.ok("Status updated successfully");
    }
}