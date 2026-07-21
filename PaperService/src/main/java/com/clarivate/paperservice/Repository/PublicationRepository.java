package com.clarivate.paperservice.Repository;

import com.clarivate.paperservice.Entity.Paper;
import com.clarivate.paperservice.Entity.PaperVersion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicationRepository extends JpaRepository<PublicationRepository, Long> {
    Paper SubmitPaper(Paper paper);

    Paper updatePaper(Paper paper);

}
