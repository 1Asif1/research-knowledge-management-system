package com.clarivate.paperservice.Dto.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PaperRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String description;
    @NotNull
    private Long authorId;
    private String status;
    private List<String>  coAuthors;
}
