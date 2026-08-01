package com.clarivate.paperservice.Service.Interface;

import com.clarivate.paperservice.Dto.Response.PaperDownloadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface PaperVersionService {

    void uploadPaperVersion(Long paperId, String content);
    void updatePaperVersion(Long paperId, MultipartFile file, String content);
    void deletePaperVersion(Long versionId);
    String getPaperVersionContent(Integer versionNumber, Long paperId);
    PaperDownloadResponse downloadPaperVersion(Long paperId, Integer versionNumber);
}
