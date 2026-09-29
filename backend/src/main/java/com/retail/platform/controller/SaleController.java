package com.retail.platform.controller;

import com.retail.platform.model.Sale;
import com.retail.platform.service.SaleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stores/{storeId}/sales")
@CrossOrigin(origins = "*")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @GetMapping
    public List<Sale> getSales(@PathVariable Long storeId,
                                @RequestParam(required = false, defaultValue = "false") boolean todayOnly) {
        if (todayOnly) {
            return saleService.getTodaySales(storeId);
        }
        return saleService.getSalesByStore(storeId);
    }

    @GetMapping("/summary")
    public Map<String, Object> getSalesSummary(@PathVariable Long storeId) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("todaysRevenue", saleService.getTodaysRevenue(storeId));
        summary.put("totalSalesCount", saleService.countByStore(storeId));
        return summary;
    }

    @PostMapping
    public ResponseEntity<?> recordSale(
            @PathVariable Long storeId, 
            @RequestBody Sale sale,
            jakarta.servlet.http.HttpServletRequest request) {

        com.retail.platform.model.Role authRole = (com.retail.platform.model.Role) request.getAttribute("auth_role");
        Long authStoreId = (Long) request.getAttribute("auth_store_id");

        if (authRole == com.retail.platform.model.Role.SHOPKEEPER || 
            authRole == com.retail.platform.model.Role.SUPERMARKET_MANAGER || 
            authRole == com.retail.platform.model.Role.STORE_MANAGER) {
            
            if (authStoreId != null && !authStoreId.equals(storeId)) {
                return ResponseEntity.status(403).body(Map.of("error", "403 Forbidden: You cannot record sales for another store."));
            }
        }

        try {
            Sale recorded = saleService.recordSale(storeId, sale);
            return ResponseEntity.ok(recorded);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
