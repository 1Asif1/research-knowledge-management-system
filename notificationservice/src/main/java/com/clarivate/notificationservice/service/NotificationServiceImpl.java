package com.clarivate.notificationservice.service;

import com.clarivate.notificationservice.dto.*;
import com.clarivate.notificationservice.exception.ResourceNotFoundException;
import com.clarivate.notificationservice.mapper.NotificationMapper;
import com.clarivate.notificationservice.model.Notification;
import com.clarivate.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    @Override
    public NotificationResponse createNotification(CreateNotificationRequest request) {

        log.info("Creating notification for userId: {}", request.getUserId());

        Notification notification = notificationMapper.toEntity(request);

        Notification savedNotification = notificationRepository.save(notification);

        log.info("Notification created successfully with id: {}", savedNotification.getId());

        return notificationMapper.toResponse(savedNotification);
    }

    @Override
    public List<NotificationResponse> getAllNotifications() {

        log.info("Fetching all notifications");

        return notificationRepository.findAll()
                .stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    @Override
    public NotificationResponse getNotificationById(Long id) {

        log.info("Fetching notification with id: {}", id);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found with id: " + id));

        return notificationMapper.toResponse(notification);
    }

    @Override
    public List<NotificationResponse> getNotificationsByUserId(Long userId) {

        log.info("Fetching notifications for userId: {}", userId);

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    @Override
    public NotificationResponse updateNotification(Long id,
                                                   UpdateNotificationRequest request) {

        log.info("Updating notification with id: {}", id);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found with id: " + id));

        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setType(request.getType());

        Notification updatedNotification = notificationRepository.save(notification);

        log.info("Notification updated successfully");

        return notificationMapper.toResponse(updatedNotification);
    }

    @Override
    public NotificationResponse markAsRead(Long id) {

        log.info("Marking notification as read. Id: {}", id);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found with id: " + id));

        notification.setIsRead(true);

        Notification updatedNotification = notificationRepository.save(notification);

        log.info("Notification marked as read");

        return notificationMapper.toResponse(updatedNotification);
    }

    @Override
    public void deleteNotification(Long id) {

        log.info("Deleting notification with id: {}", id);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found with id: " + id));

        notificationRepository.delete(notification);

        log.info("Notification deleted successfully");
    }

    @Override
    public long getUnreadCount(Long userId) {

        log.info("Fetching unread notification count for userId: {}", userId);

        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

}