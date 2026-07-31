package com.clarivate.paperservice.Service.Implementation;

import com.clarivate.paperservice.Dto.Response.PaperResponse;
import com.clarivate.paperservice.Entity.Paper;
import com.clarivate.paperservice.Entity.PaperVersion;
import com.clarivate.paperservice.Exception.ResourceNotFoundException;
import com.clarivate.paperservice.Repository.PaperRepository;
import com.clarivate.paperservice.Repository.PaperVersionRepository;
import com.clarivate.paperservice.Service.Interface.FileStorageService;
import com.clarivate.paperservice.Service.Interface.PaperVersionService;
import com.clarivate.paperservice.Util.FileUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;


@Service
public class PaperVersionServiceImpl implements PaperVersionService {

    @Autowired
    private PaperVersionRepository paperVersionRepository;

    @Autowired
    private PaperRepository paperRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Override
    public void uploadPaperVersion(Long paperId, String description) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found"));
        Integer nextVersion = paperVersionRepository.findByPaperId(paperId)
                .stream()
                .map(PaperVersion::getVersion)
                .max(Integer::compareTo)
                .orElse(0) + 1;

        PaperVersion paperVersion = new PaperVersion();
        paperVersion.setPaper(paper);
        paperVersion.setVersion(nextVersion);
        paperVersion.setDescription(description);
        paperVersionRepository.save(paperVersion);
    }

    @Override
    public void updatePaperVersion(Long paperId, MultipartFile file, String description) {
        FileUtil.validatePdfFile(file);

        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found"));

        PaperVersion version = new PaperVersion();
        version.setPaper(paper);
        version.setDescription(description);

        Integer nextVersion = paperVersionRepository.findByPaperId(paperId)
                .stream()
                .map(PaperVersion::getVersion)
                .max(Integer::compareTo)
                .orElse(0) + 1;

        String storedFileName;
        try {
            storedFileName = fileStorageService.storeFile(file);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to store manuscript file", ex);
        }

        version.setVersion(nextVersion);
        version.setFileName(storedFileName);
        version.setFilePath("/uploads/" + storedFileName);

        paperVersionRepository.save(version);
    }

    @Override
    public void deletePaperVersion(Long versionId) {
        paperVersionRepository.deleteById(versionId);

    }

    @Override
    public String getPaperVersionContent(Integer versionNumber, Long paperId) {
        PaperVersion paperVersion = paperVersionRepository.findByPaperIdAndVersion(paperId, versionNumber);
        if (paperVersion == null) {
            throw new ResourceNotFoundException("Paper version not found");
        }
        return paperVersion.toString();
    }

    public List<PaperResponse> findByPaperId(Long paperId) {
        return paperVersionRepository.findByPaperId(paperId)
                .stream()
                .map(paperVersion -> new PaperResponse(paperVersion.getPaper()))
                .toList();
    }
}
