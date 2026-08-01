package com.clarivate.paperservice.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(
        name = "publications",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_publication_paper",
                        columnNames = "paper_id"
                )
        }
)
public class Publication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "paper_id",
            nullable = false,
            unique = true
    )
    private Paper paper;

    @Column(
            name = "published_date",
            nullable = false
    )
    private LocalDate publishedDate;

    @CreationTimestamp
    @Column(
            name = "created_date",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdDate;
}