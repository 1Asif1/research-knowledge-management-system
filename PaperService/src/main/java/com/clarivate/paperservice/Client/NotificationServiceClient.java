package com.clarivate.paperservice.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service", url = "${notification-service.url:http://localhost:8004}")
public interface NotificationServiceClient {
    
    @PostMapping("/notification/create")
    Object sendNotification(@RequestBody Object notificationRequest);
}
