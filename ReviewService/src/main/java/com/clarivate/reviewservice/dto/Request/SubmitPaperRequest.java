package com.clarivate.reviewservice.dto.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitPaperRequest {
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
