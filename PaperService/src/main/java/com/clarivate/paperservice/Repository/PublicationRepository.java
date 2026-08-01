package com.clarivate.paperservice.Repository;

import com.clarivate.paperservice.Entity.Publication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PublicationRepository
        extends JpaRepository<Publication, Long> {

    boolean existsByPaperId(Long paperId);
    List<Publication> findAllByOrderByPublishedDateDesc();
}