package com.clarivate.paperservice.Dto.Request;

import lombok.Data;

@Data
public class uploadPaperVersionRequest {
    private Long paperId;
    private String changeNotes;
    private Long uploadedBy;
}
