package com.clarivate.paperservice.Controller;

import com.clarivate.paperservice.Dto.Response.PaperResponse;
import com.clarivate.paperservice.Service.Implementation.PaperVersionServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/papers/{paperId}/versions")
@RequiredArgsConstructor
public class PaperVersionController {

    private final PaperVersionServiceImpl paperVersionService;

    @PostMapping
    public ResponseEntity<String> uploadVersion(
            @PathVariable Long paperId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String changeNotes)
            throws IOException {

        paperVersionService.updatePaperVersion(
                paperId,
                file,
                changeNotes);

        return ResponseEntity.ok(
                "New version uploaded successfully");
    }

    @GetMapping
    public ResponseEntity<List<PaperResponse>>
    getVersions(@PathVariable Long paperId) {

        return ResponseEntity.ok(
                paperVersionService.findByPaperId(
                        paperId));
    }

    @GetMapping("/{versionId}")
    public ResponseEntity<String>
    getVersionById(
            @PathVariable Long paperId,
            @PathVariable Long versionId) {

        return ResponseEntity.ok(
                paperVersionService.getPaperVersionContent(
                        versionId,
                        paperId));
    }
}