package com.clarivate.paperservice.Service.Interface;

public interface PublicationService {
    String publishPaper(Long paperId);

    String updatePublishedPaper(Long paperId);

    String PublicationDetails(String paperId);
}
