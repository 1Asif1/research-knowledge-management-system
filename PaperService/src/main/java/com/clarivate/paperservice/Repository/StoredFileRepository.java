package com.clarivate.paperservice.Repository;

import com.clarivate.paperservice.Entity.StoredFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StoredFileRepository extends JpaRepository<StoredFile, Long> {
    Optional<StoredFile> findByFileName(String fileName);
    void deleteByFileName(String fileName);
}
