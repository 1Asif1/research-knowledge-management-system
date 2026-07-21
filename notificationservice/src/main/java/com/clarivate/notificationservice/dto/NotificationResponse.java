package com.clarivate.notificationservice.dto;

import com.clarivate.notificationservice.model.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class NotificationResponse {

    private Long id;

    private Long userId;

    private String title;

    private String message;

    private NotificationType type;

    private Boolean isRead;

    private LocalDateTime createdAt;

}
