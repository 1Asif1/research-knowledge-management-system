package com.clarivate.reviewservice.Repository;

import com.clarivate.reviewservice.Entity.PaperSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperSubmissionRepository extends JpaRepository<PaperSubmission, Integer> {
    List<PaperSubmission> findByResearcherId(Integer researcherId);
}
