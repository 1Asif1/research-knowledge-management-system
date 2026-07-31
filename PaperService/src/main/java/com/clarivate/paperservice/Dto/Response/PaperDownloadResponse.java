package com.clarivate.paperservice.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PaperDownloadResponse {
    private String fileName;
    private byte[] content;
}
