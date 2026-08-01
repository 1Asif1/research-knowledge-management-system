package com.clarivate.paperservice.Service.Implementation;

import com.clarivate.paperservice.Dto.Request.PublishPaperRequest;
import com.clarivate.paperservice.Dto.Response.PublicationResponse;
import com.clarivate.paperservice.Entity.Paper;
import com.clarivate.paperservice.Entity.Publication;
import com.clarivate.paperservice.Enum.PaperStatus;
import com.clarivate.paperservice.Repository.PaperRepository;
import com.clarivate.paperservice.Repository.PublicationRepository;
import com.clarivate.paperservice.Service.Interface.PublicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PublicationServiceImpl
        implements PublicationService {

    private final PublicationRepository publicationRepository;
    private final PaperRepository paperRepository;

    @Override
    public PublicationResponse publishPaper(
            PublishPaperRequest request
    ) {
        Paper paper = paperRepository
                .findById(request.getPaperId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Paper not found with id: "
                                        + request.getPaperId()
                        )
                );

        if (publicationRepository.existsByPaperId(
                request.getPaperId()
        )) {
            throw new IllegalStateException(
                    "Paper is already published"
            );
        }

        /*
         * Keep this check if your workflow updates an accepted
         * PaperService paper to APPROVED before publication.
         *
         * If ReviewService stores the editor decision but PaperService
         * status is not synchronized yet, this validation may block
         * valid publication requests. In that case, temporarily remove
         * this block until service synchronization is implemented.
         */
        if (paper.getStatus() != PaperStatus.APPROVED) {
            throw new IllegalStateException(
                    "Only approved papers can be published"
            );
        }

        paper.setStatus(PaperStatus.PUBLISHED);
        paperRepository.save(paper);

        Publication publication = new Publication();
        publication.setPaper(paper);
        publication.setPublishedDate(
                request.getPublishedDate()
        );

        Publication savedPublication =
                publicationRepository.save(publication);

        return new PublicationResponse(savedPublication);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PublicationResponse> getAllPublications() {
        return publicationRepository
                .findAllByOrderByPublishedDateDesc()
                .stream()
                .map(PublicationResponse::new)
                .toList();
    }
    @Override
    @Transactional(readOnly = true)
    public PublicationResponse getPublicationById(
            Long publicationId
    ) {
        Publication publication = publicationRepository
                .findById(publicationId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Publication not found with id: "
                                        + publicationId
                        )
                );

        return new PublicationResponse(publication);
    }
}