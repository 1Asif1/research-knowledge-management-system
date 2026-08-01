package com.clarivate.paperservice.Service.Implementation;

import com.clarivate.paperservice.Entity.StoredFile;
import com.clarivate.paperservice.Repository.StoredFileRepository;
import com.clarivate.paperservice.Service.Interface.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {
    private final StoredFileRepository storedFileRepository;

    @Override
    public String storeFile( MultipartFile file) throws IOException {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileName= UUID.randomUUID().toString() + "_" + originalFileName;

        StoredFile storedFile = new StoredFile();
        storedFile.setFileName(fileName);
        storedFile.setContentType(file.getContentType());
        storedFile.setContent(file.getBytes());
        storedFileRepository.save(storedFile);
        return fileName;
    }

    @Override
    public byte[] loadFile(String fileName) throws IOException {
        return storedFileRepository.findByFileName(fileName)
                .map(StoredFile::getContent)
                .orElseThrow(() -> new IOException("File not found: " + fileName));
    }

    @Override
    public void deleteFile(String fileName) throws IOException {
        storedFileRepository.deleteByFileName(fileName);
    }
}
