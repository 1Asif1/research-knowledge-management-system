package com.clarivate.paperservice.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "publications")
public class Publication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    private Paper paper;

    @Column(name = "publication_name")
    private String publicationName;

    @CreatedDate
    @Column(name = "created_date", nullable = false, updatable = false)
    private java.time.LocalDateTime createdDate;

    @Override
    public String toString() {
        return "Publication{" +
                "id=" + id +
                ", paper=" + paper +
                ", publicationName='" + publicationName + '\'' +
                ", createdDate=" + createdDate +
                '}';
    }
}
