package com.clarivate.paperservice.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "report-service", url = "${report-service.url:http://localhost:8005}")
public interface ReportServiceClient {
    
    @PostMapping("/report/publication")
    Object generatePublicationReport(@RequestBody Object reportRequest);
}
