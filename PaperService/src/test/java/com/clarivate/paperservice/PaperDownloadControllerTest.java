package com.clarivate.paperservice;

import com.clarivate.paperservice.Controller.PaperController;
import com.clarivate.paperservice.Controller.PaperVersionController;
import com.clarivate.paperservice.Dto.Response.PaperDownloadResponse;
import com.clarivate.paperservice.Exception.GlobalExceptionHandler;
import com.clarivate.paperservice.Exception.ResourceNotFoundException;
import com.clarivate.paperservice.Service.Implementation.PaperVersionServiceImpl;
import com.clarivate.paperservice.Service.Interface.PaperService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

class PaperDownloadControllerTest {

    @Mock
    private PaperService paperService;

    @Mock
    private PaperVersionServiceImpl paperVersionService;

    @Mock
    private HttpServletRequest request;

    private PaperController paperController;
    private PaperVersionController paperVersionController;
    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        paperController = new PaperController(paperService);
        paperVersionController = new PaperVersionController(paperVersionService);
        exceptionHandler = new GlobalExceptionHandler();
        when(request.getRequestURI()).thenReturn("/api/papers/10/versions/99/download");
    }

    @Test
    void downloadCurrentPaperVersionReturnsPdf() {
        byte[] pdfBytes = new byte[]{37, 80, 68, 70};
        when(paperService.downloadCurrentPaperVersion(10L))
                .thenReturn(new PaperDownloadResponse("current-paper.pdf", pdfBytes));

        ResponseEntity<byte[]> response = paperController.downloadCurrentPaperVersion(10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(MediaType.APPLICATION_PDF, response.getHeaders().getContentType());
        assertEquals(true, response.getHeaders().getFirst("Content-Disposition").contains("current-paper.pdf"));
        assertArrayEquals(pdfBytes, response.getBody());
    }

    @Test
    void downloadSpecificPaperVersionReturnsPdf() {
        byte[] pdfBytes = new byte[]{37, 80, 68, 70};
        when(paperVersionService.downloadPaperVersion(10L, 2))
                .thenReturn(new PaperDownloadResponse("version-2.pdf", pdfBytes));

        ResponseEntity<byte[]> response = paperVersionController.downloadVersionPdf(10L, 2);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(MediaType.APPLICATION_PDF, response.getHeaders().getContentType());
        assertEquals(true, response.getHeaders().getFirst("Content-Disposition").contains("version-2.pdf"));
        assertArrayEquals(pdfBytes, response.getBody());
    }

    @Test
    void missingVersionMapsToNotFound() {
        when(paperVersionService.downloadPaperVersion(10L, 99))
                .thenThrow(new ResourceNotFoundException("Paper version not found"));

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> paperVersionController.downloadVersionPdf(10L, 99));

        ResponseEntity<?> response = exceptionHandler.handleResourceNotFoundException(ex, request);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}
