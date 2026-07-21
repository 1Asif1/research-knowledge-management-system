package com.clarivate.paperservice.Entity;

import com.clarivate.paperservice.Dto.Request.PaperRequest;
import com.clarivate.paperservice.Enum.PaperStatus;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.util.List;

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
    private PaperStatus status;

    @OneToMany(mappedBy = "paper",cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<PaperVersion> paperVersions;

    @CreatedDate
    @Column(name="created_date",nullable = false,updatable = false)
    private java.time.LocalDateTime createdDate;

    @LastModifiedDate
    @Column(name = "last_updated")
    private java.time.LocalDateTime lastUpdated;

    @Column(name = "co_authors")
    private List<String> coAuthors;

    public Paper(PaperRequest paperRequest) {
        this.title = paperRequest.getTitle();
        this.description = paperRequest.getDescription();
        this.authorId = paperRequest.getAuthorId();
        this.status = PaperStatus.valueOf(paperRequest.getStatus());
    }
}
