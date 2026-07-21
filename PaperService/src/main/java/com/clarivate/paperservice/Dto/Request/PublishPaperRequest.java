package com.clarivate.paperservice.Dto.Request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PublishPaperRequest {
    private Long paperId;
    private String journalName;
    private LocalDate publishedDate;
}
