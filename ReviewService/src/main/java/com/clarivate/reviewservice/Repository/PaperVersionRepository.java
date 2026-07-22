package com.clarivate.reviewservice.Repository;

import com.clarivate.reviewservice.Entity.PaperVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaperVersionRepository extends JpaRepository<PaperVersion, Integer> {
    List<PaperVersion> findByPaperSubmissionPaperId(Long paperId);
    PaperVersion findTopByPaperSubmissionPaperIdOrderByVersionNumberDesc(Long paperId);
}
