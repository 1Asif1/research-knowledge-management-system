package com.clarivate.paperservice.Service.Interface;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileStorageService {

    String storeFile(MultipartFile file) throws IOException;

    byte[] loadFile(String fileName) throws IOException;

    void deleteFile(String fileName) throws IOException;
}
