package com.clarivate.paperservice.Util;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public class FileUtil {

    private static final List<String> ALLOWED_TYPES =
            List.of("application/pdf");

    private FileUtil() {
    }

    public static void validatePdfFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }
    }
}