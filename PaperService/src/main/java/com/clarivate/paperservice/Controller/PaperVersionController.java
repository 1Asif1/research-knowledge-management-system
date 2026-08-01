package com.clarivate.paperservice.Controller;

import com.clarivate.paperservice.Dto.Response.PaperResponse;
import com.clarivate.paperservice.Dto.Response.PaperDownloadResponse;
import com.clarivate.paperservice.Service.Implementation.PaperVersionServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
            @PathVariable("versionId") Integer versionNumber) {

        return ResponseEntity.ok(
                paperVersionService.getPaperVersionContent(
                        versionNumber,
                        paperId));
    }

    @GetMapping(value = "/{versionId}/download", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadVersionPdf(
            @PathVariable Long paperId,
            @PathVariable("versionId") Integer versionNumber) {

        PaperDownloadResponse response = paperVersionService.downloadPaperVersion(paperId, versionNumber);
        String fileName = response.getFileName().toLowerCase().endsWith(".pdf")
                ? response.getFileName()
                : response.getFileName() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(fileName).build().toString())
                .contentType(MediaType.APPLICATION_PDF)
                .body(response.getContent());
    }
}