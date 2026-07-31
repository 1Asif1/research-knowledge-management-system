package com.clarivate.paperservice.Dto.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResearcherUploadVersionRequest {
    @NotBlank
    private String fileName;
    @NotBlank
    private String filePath;
    private String changeSummary;
}
