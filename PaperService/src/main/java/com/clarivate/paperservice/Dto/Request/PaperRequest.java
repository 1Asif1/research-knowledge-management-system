package com.clarivate.paperservice.Dto.Request;

import lombok.Data;

import java.util.List;

@Data
public class PaperRequest {
    private String title;
    private String description;
    private Long authorId;
    private String status;
    private List<String>  coAuthors;
}
