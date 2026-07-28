package com.clarivate.paperservice.Repository;

import com.clarivate.paperservice.Entity.Publication;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicationRepository extends JpaRepository<Publication, Long> {
}
