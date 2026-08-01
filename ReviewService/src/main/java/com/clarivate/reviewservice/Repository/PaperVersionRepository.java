package com.clarivate.reviewservice.Repository;

import com.clarivate.reviewservice.Entity.PaperVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaperVersionRepository extends JpaRepository<PaperVersion, Long> {

    List<PaperVersion> findByPaperSubmissionPaperId(Long paperId);

    PaperVersion findTopByPaperSubmissionPaperIdOrderByVersionNumberDesc(
            Long paperId
    );

    Optional<PaperVersion> findByPaperSubmissionPaperIdAndVersionNumber(
            Long paperId,
            int versionNumber
    );

    Optional<PaperVersion> findByVersionIdAndPaperSubmissionPaperId(
            Long versionId,
            Long paperId
    );
}