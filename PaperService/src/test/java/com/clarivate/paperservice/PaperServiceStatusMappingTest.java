package com.clarivate.paperservice;

import com.clarivate.paperservice.Client.NotificationServiceClient;
import com.clarivate.paperservice.Client.ReviewServiceClient;
import com.clarivate.paperservice.Client.UserServiceClient;
import com.clarivate.paperservice.Entity.Paper;
import com.clarivate.paperservice.Enum.PaperStatus;
import com.clarivate.paperservice.Repository.PaperRepository;
import com.clarivate.paperservice.Repository.PaperVersionRepository;
import com.clarivate.paperservice.Service.Implementation.PaperServiceImpl;
import com.clarivate.paperservice.Service.Interface.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PaperServiceStatusMappingTest {

    @Mock
    private PaperRepository paperRepository;

    @Mock
    private PaperVersionRepository paperVersionRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private ReviewServiceClient reviewServiceClient;

    @Mock
    private NotificationServiceClient notificationServiceClient;

    @Mock
    private UserServiceClient userServiceClient;

    private PaperServiceImpl paperService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        paperService = new PaperServiceImpl(
                paperRepository,
                paperVersionRepository,
                fileStorageService,
                reviewServiceClient,
                notificationServiceClient,
                userServiceClient);
    }

    @Test
    void changeStatusResolvesReviewPaperId() {
        Paper paper = new Paper();
        paper.setId(11L);
        paper.setTitle("Status mapping paper");
        paper.setDescription("Status mapping paper");
        paper.setAuthorId(100L);
        paper.setStatus(PaperStatus.SUBMITTED);
        paper.setReviewPaperId(9001L);

        when(paperRepository.findById(9001L)).thenReturn(Optional.empty());
        when(paperRepository.findByReviewPaperId(9001L)).thenReturn(Optional.of(paper));
        when(paperRepository.save(any(Paper.class))).thenAnswer(invocation -> invocation.getArgument(0));

        paperService.changeStatus(9001L, "APPROVED");

        ArgumentCaptor<Paper> captor = ArgumentCaptor.forClass(Paper.class);
        verify(paperRepository).save(captor.capture());
        assertEquals(PaperStatus.APPROVED, captor.getValue().getStatus());
    }
}
