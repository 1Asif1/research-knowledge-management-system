package com.clarivate.reviewservice.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "paper-service", url = "${paper-service.url:http://localhost:8083}")
public interface PaperServiceClient {

    @PatchMapping("/api/papers/{paperId}/status")
    String updateStatus(@PathVariable Long paperId, @RequestParam String status);
}
