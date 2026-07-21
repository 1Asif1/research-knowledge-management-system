package com.clarivate.reviewservice.dto.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UploadVersionRequest {
    @NotBlank
    private String fileName;
    @NotBlank
    private String filePath;

    private String changeSummary;
}
