package com.clarivate.paperservice.Service.Interface;

import com.clarivate.paperservice.Dto.Request.PublishPaperRequest;
import com.clarivate.paperservice.Dto.Response.PublicationResponse;

import java.util.List;

public interface PublicationService {

    PublicationResponse publishPaper(
            PublishPaperRequest request
    );

    PublicationResponse getPublicationById(
            Long publicationId
    );
    List<PublicationResponse> getAllPublications();
}