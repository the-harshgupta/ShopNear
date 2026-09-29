package com.retail.platform.controller;

import com.retail.platform.model.DemandLog;
import com.retail.platform.service.DemandAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class DemandAnalyticsController {

    private final DemandAnalyticsService demandAnalyticsService;

    public DemandAnalyticsController(DemandAnalyticsService demandAnalyticsService) {
        this.demandAnalyticsService = demandAnalyticsService;
    }

    @GetMapping("/demand-insights")
    public ResponseEntity<List<DemandLog>> getDemandInsights() {
        return ResponseEntity.ok(demandAnalyticsService.getDemandInsights());
    }

    @PostMapping("/log")
    public ResponseEntity<?> logEvent(@RequestBody Map<String, Object> payload) {
        String keyword = (String) payload.get("keyword");
        Long productId = payload.get("productId") != null ? Long.parseLong(payload.get("productId").toString()) : null;
        demandAnalyticsService.recordSearchEvent(keyword, productId);
        return ResponseEntity.ok(Map.of("status", "logged"));
    }
}
