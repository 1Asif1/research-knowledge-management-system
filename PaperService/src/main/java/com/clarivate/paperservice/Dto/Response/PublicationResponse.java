package com.clarivate.paperservice.Dto.Response;

import com.clarivate.paperservice.Entity.Publication;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublicationResponse {

    private Long id;
    private Long paperId;
    private String title;
    private LocalDate publishedDate;

    public PublicationResponse(Publication publication) {
        this.id = publication.getId();

        this.paperId = publication.getPaper() != null
                ? publication.getPaper().getId()
                : null;

        this.title = publication.getPaper() != null
                ? publication.getPaper().getTitle()
                : null;

        this.publishedDate = publication.getPublishedDate();
    }
}