package com.clarivate.paperservice.Service.Implementation;

import com.clarivate.paperservice.Repository.PublicationRepository;
import com.clarivate.paperservice.Repository.PaperRepository;
import com.clarivate.paperservice.Entity.Publication;
import com.clarivate.paperservice.Service.Interface.PublicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PublicationServiceImpl implements PublicationService {

    @Autowired
    PublicationRepository publicationRepository;

    @Autowired
    PaperRepository paperRepository;

    @Override
    public String publishPaper(Long paperId) {
        Publication publication = new Publication();
        publication.setPaper(paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found")));
        publication.setPublicationName("Publication " + paperId);
        publicationRepository.save(publication);
        return "Paper " + paperId + " published";
    }

    @Override
    public String updatePublishedPaper(Long paperId) {
        return "Paper " + paperId+" updated";
    }

    @Override
    public String PublicationDetails(String paperId) {
        return "Details of paper " + paperId + " \n" + publicationRepository.findById(Long.parseLong(paperId)).orElse(null);

    }
}
