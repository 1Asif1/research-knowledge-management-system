package com.clarivate.paperservice.Controller;

import com.clarivate.paperservice.Dto.Request.PublishPaperRequest;
import com.clarivate.paperservice.Dto.Response.PublicationResponse;
import com.clarivate.paperservice.Service.Interface.PublicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/publications")
@RequiredArgsConstructor
public class PublicationController {

    private final PublicationService publicationService;

    @PostMapping
    public ResponseEntity<PublicationResponse> publishPaper(
            @Valid @RequestBody PublishPaperRequest request
    ) {
        PublicationResponse response =
                publicationService.publishPaper(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<PublicationResponse>>
    getAllPublications() {

        return ResponseEntity.ok(
                publicationService.getAllPublications()
        );
    }

    @GetMapping("/{publicationId}")
    public ResponseEntity<PublicationResponse>
    getPublicationById(
            @PathVariable Long publicationId
    ) {
        return ResponseEntity.ok(
                publicationService.getPublicationById(
                        publicationId
                )
        );
    }
}