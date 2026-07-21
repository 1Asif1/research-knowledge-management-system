package com.clarivate.paperservice.Service.Implementation;

import com.clarivate.paperservice.Repository.PublicationRepository;
import com.clarivate.paperservice.Service.Interface.PublicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PublicationServiceImpl implements PublicationService {

    @Autowired
    PublicationRepository publicationRepository;

    @Override
    public String publishPaper(Long paperId) {
        return "Paper " + paperId+" published";
    }

    @Override
    public String updatePublishedPaper(Long paperId) {
        return "Paper " + paperId+" updated";
    }

    @Override
    public String PublicationDetails(String paperId) {
        return "Details of paper " + paperId+" \n"+publicationRepository.findById(Long.parseLong(paperId)).orElse(null);

    }
}
