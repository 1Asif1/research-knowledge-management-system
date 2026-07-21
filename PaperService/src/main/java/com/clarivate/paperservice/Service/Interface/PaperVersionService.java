package com.clarivate.paperservice.Service.Interface;

import org.springframework.web.multipart.MultipartFile;

public interface PaperVersionService {

    void uploadPaperVersion(Long paperId, String content);
    void updatePaperVersion(Long versionId, MultipartFile file, String content);
    void deletePaperVersion(Long versionId);
    String getPaperVersionContent(Long versionId,Long paperId);
}
