package com.clarivate.notificationservice.mapper;

import com.clarivate.notificationservice.dto.CreateNotificationRequest;
import com.clarivate.notificationservice.dto.NotificationResponse;
import com.clarivate.notificationservice.model.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public Notification toEntity(CreateNotificationRequest request) {

        return Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .build();
    }

    public NotificationResponse toResponse(Notification notification) {

        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

}