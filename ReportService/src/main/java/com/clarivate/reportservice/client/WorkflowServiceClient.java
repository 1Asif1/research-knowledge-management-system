package com.clarivate.reportservice.client;

import com.clarivate.reportservice.dto.PublicationClientResponse;
import com.clarivate.reportservice.dto.ReviewProcessClientResponse;
import com.clarivate.reportservice.dto.StatusHistoryReportDto;
import com.clarivate.reportservice.exception.DownstreamServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class WorkflowServiceClient {

    private final RestTemplate restTemplate;

    @Value("${review-service.url:http://localhost:8085}")
    private String reviewServiceUrl;

    @Value("${paper-service.url:http://localhost:8083}")
    private String paperServiceUrl;

    public List<ReviewProcessClientResponse> getPendingReviews() {
        String url = UriComponentsBuilder
                .fromUriString(reviewServiceUrl)
                .path("/api/editor/reviews/pending")
                .build()
                .toUriString();

        return fetchList(
                url,
                new ParameterizedTypeReference<
                        List<ReviewProcessClientResponse>>() {
                },
                "ReviewService"
        );
    }

    public List<ReviewProcessClientResponse> getEditorReviews(
            Long editorId
    ) {
        if (editorId == null || editorId <= 0) {
            throw new IllegalArgumentException(
                    "editorId must be a positive value"
            );
        }

        String url = UriComponentsBuilder
                .fromUriString(reviewServiceUrl)
                .path("/api/editor/{editorId}/reviews")
                .buildAndExpand(editorId)
                .toUriString();

        return fetchList(
                url,
                new ParameterizedTypeReference<
                        List<ReviewProcessClientResponse>>() {
                },
                "ReviewService"
        );
    }

    public List<PublicationClientResponse> getPublications() {
        String url = UriComponentsBuilder
                .fromUriString(paperServiceUrl)
                .path("/api/publications")
                .build()
                .toUriString();

        return fetchList(
                url,
                new ParameterizedTypeReference<
                        List<PublicationClientResponse>>() {
                },
                "PaperService"
        );
    }

    public List<StatusHistoryReportDto> getPaperHistory(Long paperId) {
        if (paperId == null || paperId <= 0) {
            return Collections.emptyList();
        }

        String url = UriComponentsBuilder
                .fromUriString(reviewServiceUrl)
                .path("/api/editor/paper/{paperId}/history")
                .buildAndExpand(paperId)
                .toUriString();

        return fetchList(
                url,
                new ParameterizedTypeReference<List<StatusHistoryReportDto>>() {
                },
                "ReviewService"
        );
    }

    private <T> List<T> fetchList(
            String url,
            ParameterizedTypeReference<List<T>> type,
            String serviceName
    ) {
        try {
            ResponseEntity<List<T>> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            null,
                            type
                    );

            List<T> body = response.getBody();

            return body == null
                    ? Collections.emptyList()
                    : body;

        } catch (RestClientException exception) {
            throw new DownstreamServiceException(
                    serviceName
                            + " is unavailable: "
                            + exception.getMessage(),
                    exception
            );
        }
    }
}