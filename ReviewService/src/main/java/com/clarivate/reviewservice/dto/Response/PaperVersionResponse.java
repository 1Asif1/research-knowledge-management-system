package com.clarivate.reviewservice.dto.Response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaperVersionResponse {
    private Long versionId;
    private Integer versionNumber;
    private String filename;
    private String changeSummary;
}
