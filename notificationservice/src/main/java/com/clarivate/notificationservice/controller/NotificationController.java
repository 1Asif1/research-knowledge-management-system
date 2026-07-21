package com.clarivate.notificationservice.controller;

import com.clarivate.notificationservice.dto.*;
import com.clarivate.notificationservice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Controller", description = "APIs for managing notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    @Operation(summary = "Create a new notification")
    public ResponseEntity<NotificationResponse> createNotification(
            @Valid @RequestBody CreateNotificationRequest request) {

        NotificationResponse response =
                notificationService.createNotification(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    @Operation(summary = "Get all notifications")
    public ResponseEntity<List<NotificationResponse>> getAllNotifications() {

        return ResponseEntity.ok(
                notificationService.getAllNotifications());
    }

    @GetMapping("/{notificationId}")
    @Operation(summary = "Get notification by ID")
    public ResponseEntity<NotificationResponse> getNotificationById(
            @PathVariable Long notificationId) {

        return ResponseEntity.ok(
                notificationService.getNotificationById(notificationId));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get notifications by user ID")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByUserId(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService.getNotificationsByUserId(userId));
    }

    @PutMapping("/{notificationId}")
    @Operation(summary = "Update notification")
    public ResponseEntity<NotificationResponse> updateNotification(
            @PathVariable Long notificationId,
            @Valid @RequestBody UpdateNotificationRequest request) {

        return ResponseEntity.ok(
                notificationService.updateNotification(notificationId, request));
    }

    @PutMapping("/{notificationId}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long notificationId) {

        return ResponseEntity.ok(
                notificationService.markAsRead(notificationId));
    }

    @DeleteMapping("/{notificationId}")
    @Operation(summary = "Delete notification")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long notificationId) {

        notificationService.deleteNotification(notificationId);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @PathVariable Long userId) {

        long count = notificationService.getUnreadCount(userId);

        return ResponseEntity.ok(
                Map.of("count", count));
    }

}
