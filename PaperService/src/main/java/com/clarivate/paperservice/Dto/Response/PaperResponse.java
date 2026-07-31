package com.clarivate.paperservice.Dto.Response;

import com.clarivate.paperservice.Entity.Paper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.jspecify.annotations.NonNull;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaperResponse {
    private Long id;
    private String title;
    private String description;
    private String authorName;
    private String status;
    private List<String> coAuthors;

    public PaperResponse(@NonNull Paper paper) {
        this.id = paper.getId();
        this.title = paper.getTitle();
        this.description = paper.getDescription();
        this.authorName = paper.getAuthor() != null ? paper.getAuthor() : String.valueOf(paper.getAuthorId());
        this.status = paper.getStatus() != null ? paper.getStatus().name() : "DRAFT";
        this.coAuthors = paper.getCoAuthors() != null ? paper.getCoAuthors() : List.of();
    }

}
