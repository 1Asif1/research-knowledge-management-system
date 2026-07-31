package com.clarivate.paperservice.Client;

import com.clarivate.paperservice.Dto.Request.NotificationCreateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service", url = "${notification-service.url:http://localhost:8084}")
public interface NotificationServiceClient {
    
    @PostMapping("/notifications")
    void sendNotification(@RequestBody NotificationCreateRequest notificationRequest);
}
