package com.clarivate.paperservice.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FileUploadResponse {
    private String fileName;
    private String originalFileName;
    private Long fileSize;
    private String description;
}
