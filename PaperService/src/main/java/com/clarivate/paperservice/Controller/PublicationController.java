package com.clarivate.paperservice.Controller;

import com.clarivate.paperservice.Dto.Request.PublishPaperRequest;
import com.clarivate.paperservice.Dto.Response.PublicationResponse;
import com.clarivate.paperservice.Service.Implementation.PublicationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/publications")
@RequiredArgsConstructor
public class PublicationController {

    private final PublicationServiceImpl publicationService;

    @PostMapping
    public ResponseEntity<String> publishPaper(
            @RequestBody PublishPaperRequest request) {

        return ResponseEntity.ok(
                publicationService.publishPaper(request.getPaperId()));
    }

    @GetMapping("/{publicationId}")
    public ResponseEntity<String>
    getPublication(
            @PathVariable Long publicationId) {

        return ResponseEntity.ok(
                publicationService.PublicationDetails(
                        publicationId.toString()));
    }
}