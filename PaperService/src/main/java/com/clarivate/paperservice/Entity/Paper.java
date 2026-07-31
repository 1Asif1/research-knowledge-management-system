package com.clarivate.paperservice.Entity;

import com.clarivate.paperservice.Dto.Request.PaperRequest;
import com.clarivate.paperservice.Enum.PaperStatus;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.List;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "papers")
public class Paper {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    private Long authorId;

    private String author;

    @Lob
    @Column(name="file_data")
    private byte[] fileData;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaperStatus status;

    @OneToMany(mappedBy = "paper",cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<PaperVersion> paperVersions;

    @CreationTimestamp
    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @ElementCollection
    @CollectionTable(name = "paper_co_authors", joinColumns = @JoinColumn(name = "paper_id"))
    @Column(name = "co_author")
    private List<String> coAuthors;

    public Paper(PaperRequest paperRequest) {
        this.title = paperRequest.getTitle();
        this.description = paperRequest.getDescription();
        this.authorId = paperRequest.getAuthorId();
        this.author = paperRequest.getAuthorId() != null ? "User #" + paperRequest.getAuthorId() : null;
        this.status = paperRequest.getStatus() != null ? PaperStatus.valueOf(paperRequest.getStatus()) : PaperStatus.DRAFT;
        this.coAuthors = paperRequest.getCoAuthors();
    }
}
