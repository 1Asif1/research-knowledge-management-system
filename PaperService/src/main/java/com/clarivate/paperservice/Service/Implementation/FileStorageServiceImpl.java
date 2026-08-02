package com.clarivate.paperservice.Service.Implementation;

import com.clarivate.paperservice.Entity.StoredFile;
import com.clarivate.paperservice.Repository.StoredFileRepository;
import com.clarivate.paperservice.Service.Interface.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashSet;
import java.util.Set;
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
    @Transactional(readOnly = true)
    public byte[] loadFile(String fileNameOrPath) throws IOException {
        for (String key : buildLookupKeys(fileNameOrPath)) {
            var stored = storedFileRepository.findByFileName(key);
            if (stored.isPresent()) {
                return stored.get().getContent();
            }
        }

        for (Path path : buildDiskCandidatePaths(fileNameOrPath)) {
            if (Files.exists(path) && Files.isRegularFile(path)) {
                return Files.readAllBytes(path);
            }
        }

        throw new IOException("File not found: " + fileNameOrPath);
    }

    @Override
    public void deleteFile(String fileName) throws IOException {
        storedFileRepository.deleteByFileName(fileName);
    }

    private Set<String> buildLookupKeys(String fileNameOrPath) {
        Set<String> keys = new LinkedHashSet<>();
        if (!StringUtils.hasText(fileNameOrPath)) {
            return keys;
        }

        String trimmed = fileNameOrPath.trim();
        keys.add(trimmed);

        String normalized = trimmed.replace('\\', '/');
        keys.add(normalized);

        String basename = normalized;
        int lastSlash = normalized.lastIndexOf('/');
        if (lastSlash >= 0 && lastSlash < normalized.length() - 1) {
            basename = normalized.substring(lastSlash + 1);
            keys.add(basename);
        }

        if (normalized.startsWith("/")) {
            keys.add(normalized.substring(1));
        }

        if (normalized.startsWith("uploads/") && basename.length() < normalized.length()) {
            keys.add(normalized.substring("uploads/".length()));
        }
        if (normalized.startsWith("/uploads/") && basename.length() < normalized.length()) {
            keys.add(normalized.substring("/uploads/".length()));
        }

        return keys;
    }

    private Set<Path> buildDiskCandidatePaths(String fileNameOrPath) {
        Set<Path> paths = new LinkedHashSet<>();
        if (!StringUtils.hasText(fileNameOrPath)) {
            return paths;
        }

        String trimmed = fileNameOrPath.trim();
        String normalized = trimmed.replace('\\', '/');
        String relativeNormalized = normalized.startsWith("/") ? normalized.substring(1) : normalized;
        String basename = relativeNormalized;
        int lastSlash = relativeNormalized.lastIndexOf('/');
        if (lastSlash >= 0 && lastSlash < relativeNormalized.length() - 1) {
            basename = relativeNormalized.substring(lastSlash + 1);
        }

        Path direct = Path.of(trimmed);
        if (direct.isAbsolute()) {
            paths.add(direct);
        }

        paths.add(Path.of(relativeNormalized));
        paths.add(Path.of("uploads", basename));
        paths.add(Path.of("PaperService", "uploads", basename));
        return paths;
    }
}
