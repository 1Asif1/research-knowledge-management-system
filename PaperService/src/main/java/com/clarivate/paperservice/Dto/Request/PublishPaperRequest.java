package com.clarivate.paperservice.Dto.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PublishPaperRequest {
    @NotNull
    private Long paperId;
    @NotBlank
    private String journalName;
    @NotNull
    private LocalDate publishedDate;
}
