package com.clarivate.paperservice.Dto.Request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewUploadVersionRequest {
    private String fileName;
    private String filePath;
    private String changeSummary;
}
