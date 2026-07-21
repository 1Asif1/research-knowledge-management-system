package com.clarivate.paperservice.Repository;

import com.clarivate.paperservice.Entity.PaperVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaperVersionRepository extends JpaRepository<PaperVersion, Long> {
    List<PaperVersion> findByPaperId(Long paperId);
    PaperVersion findByPaperIdAndVersionId(Long paperId,Long versionId);
}
