package com.clarivate.paperservice.Service.Implementation;

import com.clarivate.paperservice.Dto.Response.PaperResponse;
import com.clarivate.paperservice.Dto.Response.PaperDownloadResponse;
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
import java.util.ArrayList;
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
        Paper paper = findPaperForReviewerOrThrow(paperId);
        PaperVersion paperVersion = resolvePaperVersion(paper.getId(), versionNumber);
        return paperVersion.toString();
    }

    @Override
    public PaperDownloadResponse downloadPaperVersion(Long paperId, Integer versionNumber) {
        Paper paper = findPaperForReviewerOrThrow(paperId);
        PaperVersion paperVersion = resolvePaperVersion(paper.getId(), versionNumber);
        List<String> references = new ArrayList<>();
        references.add(paperVersion.getFileName());
        references.add(paperVersion.getFilePath());

        String responseFileName = references.stream()
                .filter(this::hasText)
                .map(this::extractFileName)
                .filter(this::hasText)
                .findFirst()
                .orElse(null);

        if (responseFileName == null) {
            throw new ResourceNotFoundException("Paper file not found for this version");
        }

        for (String reference : references) {
            if (!hasText(reference)) {
                continue;
            }
            try {
                return new PaperDownloadResponse(responseFileName, fileStorageService.loadFile(reference));
            } catch (IOException ignored) {
                // Try next available file reference.
            }
        }

        throw new ResourceNotFoundException("Paper file not found for this version");
    }

    public List<PaperResponse> findByPaperId(Long paperId) {
        Paper paper = findPaperForReviewerOrThrow(paperId);
        return paperVersionRepository.findByPaperId(paper.getId())
                .stream()
                .map(paperVersion -> new PaperResponse(paperVersion.getPaper()))
                .toList();
    }

    private Paper findPaperForReviewerOrThrow(Long paperId) {
        return paperRepository.findById(paperId)
                .or(() -> paperRepository.findByReviewPaperId(paperId))
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found"));
    }

    private PaperVersion resolvePaperVersion(Long paperId, Integer versionNumber) {
        PaperVersion paperVersion = paperVersionRepository.findByPaperIdAndVersion(paperId, versionNumber);
        if (paperVersion != null) {
            return paperVersion;
        }

        if (versionNumber != null) {
            return paperVersionRepository.findById(versionNumber.longValue())
                    .filter(candidate -> candidate.getPaper() != null
                            && candidate.getPaper().getId().equals(paperId))
                    .orElseThrow(() -> new ResourceNotFoundException("Paper version not found"));
        }

        throw new ResourceNotFoundException("Paper version not found");
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String extractFileName(String fileNameOrPath) {
        String normalized = fileNameOrPath.replace('\\', '/');
        int lastSlash = normalized.lastIndexOf('/');
        return lastSlash >= 0 && lastSlash < normalized.length() - 1
                ? normalized.substring(lastSlash + 1)
                : normalized;
    }
}
