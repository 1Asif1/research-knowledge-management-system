package com.clarivate.paperservice.Dto.Response;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PublicationResponse {
    private Long id;
    private Long paperId;
    private String title;
    private String journal;
    private LocalDate publishedDate;
}
