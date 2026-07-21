package com.clarivate.paperservice.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "paper_versions")
@Data
public class PaperVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paper_id")
    @JsonBackReference
    private Paper paper;

    private String description;

    @Override
    public String toString() {
        return "PaperVersion{" +
                "id=" + id +
                ", version=" + version +
                ", description='" + description + '\'' +
                '}';
    }
}
