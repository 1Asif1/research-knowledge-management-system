package com.clarivate.paperservice.Dto.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResearcherSubmitPaperRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String abstractText;
    @NotBlank
    private String fileName;
    @NotBlank
    private String filePath;
    @NotNull
    private Long researcherId;
}
