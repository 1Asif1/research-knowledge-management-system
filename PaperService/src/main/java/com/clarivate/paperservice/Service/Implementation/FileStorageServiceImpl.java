package com.clarivate.paperservice.Service.Implementation;

import com.clarivate.paperservice.Service.Interface.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {
    private final Path fileStorageLocation;
    public FileStorageServiceImpl(@Value("${file.upload-dir}") String uploadDir) {
        this.fileStorageLocation= Paths.get(uploadDir)
        .toAbsolutePath().normalize();

    }

    @Override
    public String storeFile( MultipartFile file) throws IOException {
        String OriginalfileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileName= UUID.randomUUID().toString() + "_" + OriginalfileName;
        Path targetLocation = fileStorageLocation.resolve(fileName);
        Files.copy(file.getInputStream(),
                targetLocation,
                StandardCopyOption.REPLACE_EXISTING);
        return fileName;
    }

    @Override
    public byte[] loadFile(String fileName) throws IOException {
        Path filePath = fileStorageLocation.resolve(fileName).normalize();
        return Files.readAllBytes(filePath);
    }

    @Override
    public void deleteFile(String fileName) throws IOException {
        Path filePath = fileStorageLocation.resolve(fileName).normalize();
        Files.deleteIfExists(filePath);

    }
}
