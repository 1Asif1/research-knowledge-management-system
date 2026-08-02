package com.clarivate.paperservice.Dto.Response;

import com.clarivate.paperservice.Entity.Publication;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublicationResponse {

    private Long id;
    private Long paperId;
    private String title;
    private String description;
    private String authorName;
    private List<String> coAuthors;
    private String status;
    private LocalDateTime createdDate;
    private LocalDate publishedDate;

    public PublicationResponse(Publication publication) {
        this.id = publication.getId();

        if (publication.getPaper() != null) {
            this.paperId = publication.getPaper().getId();
            this.title = publication.getPaper().getTitle();
            this.description = publication.getPaper().getDescription();
            this.authorName = publication.getPaper().getAuthor() != null
                    ? publication.getPaper().getAuthor()
                    : (publication.getPaper().getAuthorId() != null ? "User #" + publication.getPaper().getAuthorId() : null);
            this.coAuthors = publication.getPaper().getCoAuthors();
            this.status = publication.getPaper().getStatus() != null ? publication.getPaper().getStatus().name() : null;
            this.createdDate = publication.getPaper().getCreatedDate();
        }

        this.publishedDate = publication.getPublishedDate();
    }
}