package com.clarivate.reportservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PublicationClientResponse {
    private Long id;
    private Long paperId;
    private String title;
    private String description;
    private String authorName;
    private List<String> coAuthors;
    private String status;
    private String createdDate;
    private String publishedDate;
}
