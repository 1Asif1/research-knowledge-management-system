package com.clarivate.paperservice.Repository;

import com.clarivate.paperservice.Entity.Paper;
import com.clarivate.paperservice.Enum.PaperStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperRepository extends JpaRepository<Paper, Long> {
    List<Paper> findByAuthorId(Long authorId);

    List<Paper> findByStatus(PaperStatus status);

    Page<Paper> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Paper> findByDescriptionContainingIgnoreCase(String description, Pageable pageable);
}
