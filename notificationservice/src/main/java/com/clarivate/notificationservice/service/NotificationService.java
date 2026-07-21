package com.clarivate.notificationservice.service;

import com.clarivate.notificationservice.dto.*;

import java.util.List;

public interface NotificationService {

    NotificationResponse createNotification(CreateNotificationRequest request);

    List<NotificationResponse> getAllNotifications();

    NotificationResponse getNotificationById(Long id);

    List<NotificationResponse> getNotificationsByUserId(Long userId);

    NotificationResponse updateNotification(Long id, UpdateNotificationRequest request);

    NotificationResponse markAsRead(Long id);

    void deleteNotification(Long id);

    long getUnreadCount(Long userId);

}
