package com.clarivate.notificationservice.dto;

import com.clarivate.notificationservice.model.NotificationType;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
public class UpdateNotificationRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Notification type is required")
    private NotificationType type;

}