package com.clarivate.paperservice.Dto.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdatePaperRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String description;

}
