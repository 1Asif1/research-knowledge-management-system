package com.clarivate.paperservice.Service.Implementation;

import com.clarivate.paperservice.Dto.Response.PaperResponse;
import com.clarivate.paperservice.Entity.Paper;
import com.clarivate.paperservice.Entity.PaperVersion;
import com.clarivate.paperservice.Repository.PaperRepository;
import com.clarivate.paperservice.Repository.PaperVersionRepository;
import com.clarivate.paperservice.Service.Interface.PaperVersionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@Service
public class PaperVersionServiceImpl implements PaperVersionService {

    @Autowired
    private PaperVersionRepository paperVersionRepository;

    @Autowired
    private PaperRepository paperRepository;

    @Override
    public void uploadPaperVersion(Long paperId, String description) {
        PaperVersion paperVersion = paperVersionRepository.findByPaperId(paperId).stream().findFirst().orElse(null);
        if (paperVersion != null) {
            paperVersion.setVersion(paperVersion.getVersion() + 1);
            paperVersion.setDescription(description);
            paperVersionRepository.save(paperVersion);
        }
        else {
            uploadPaperVersion(paperId, description);
        }
    }

    @Override
    public void updatePaperVersion(Long paperId, MultipartFile file, String description) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));

        PaperVersion version = new PaperVersion();
        // Handle file upload logic here
        version.setPaper(paper);
        version.setDescription(description);

        Integer nextVersion = paper.getPaperVersions()
                .stream()
                .map(PaperVersion::getVersion)
                .max(Integer::compareTo)
                .orElse(0) + 1;

        version.setVersion(nextVersion);

        paperVersionRepository.save(version);
    }

    @Override
    public void deletePaperVersion(Long versionId) {
        paperVersionRepository.deleteById(versionId);

    }

    @Override
    public String getPaperVersionContent(Long versionId,Long paperId) {
        PaperVersion paperVersion = paperVersionRepository.findByPaperIdAndVersionId(paperId, versionId);
        return paperVersion != null ? paperVersion.toString() : "Paper version not found";
    }

    public List<PaperResponse> findByPaperId(Long paperId) {
        return paperVersionRepository.findByPaperId(paperId)
                .stream()
                .map(paperVersion -> new PaperResponse(
                ))
                .toList();
    }
}
