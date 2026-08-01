package com.clarivate.paperservice.Dto.Request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublishPaperRequest {

    @NotNull(message = "Paper ID is required")
    private Long paperId;

    @NotNull(message = "Published date is required")
    private LocalDate publishedDate;
}