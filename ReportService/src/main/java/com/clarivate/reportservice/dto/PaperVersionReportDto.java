package com.clarivate.reportservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaperVersionReportDto {
    private Integer versionNumber;
    private String fileName;
    private String changeSummary;
    private String uploadedBy;
    private LocalDateTime uploadedDate;
}
