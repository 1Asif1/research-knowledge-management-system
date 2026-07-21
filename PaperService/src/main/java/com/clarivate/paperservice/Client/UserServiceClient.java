package com.clarivate.paperservice.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "${user-service.url:http://localhost:8001}")
public interface UserServiceClient {
    
    @GetMapping("/user/{id}")
    Object getUserById(@PathVariable Long id);
}
