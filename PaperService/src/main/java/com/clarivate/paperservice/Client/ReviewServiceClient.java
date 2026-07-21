package com.clarivate.paperservice.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "review-service", url = "${review-service.url:http://localhost:8003}")
public interface ReviewServiceClient {
    
    @GetMapping("/review/paper/{paperId}")
    Object getReviewsByPaper(@PathVariable Long paperId);
}
