package com.retail.platform.service;

import com.retail.platform.model.DemandLog;
import com.retail.platform.model.StoreProduct;
import com.retail.platform.repository.DemandLogRepository;
import com.retail.platform.repository.StoreProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DemandAnalyticsService {

    private final DemandLogRepository demandLogRepository;
    private final StoreProductRepository storeProductRepository;

    public DemandAnalyticsService(DemandLogRepository demandLogRepository, StoreProductRepository storeProductRepository) {
        this.demandLogRepository = demandLogRepository;
        this.storeProductRepository = storeProductRepository;
    }

    public List<DemandLog> getDemandInsights() {
        return demandLogRepository.findByOrderByMissedSearchesCountDesc();
    }

    @Transactional
    public void recordSearchEvent(String keyword, Long storeProductId) {
        if (storeProductId != null) {
            storeProductRepository.findById(storeProductId).ifPresent(sp -> {
                if (sp.getStockQuantity() == 0) {
                    DemandLog log = demandLogRepository.findByProductId(sp.getId())
                            .orElse(new DemandLog(
                                    sp.getProduct().getName(),
                                    sp.getId(),
                                    "SEARCH_UNAVAILABLE",
                                    0,
                                    0,
                                    0.0,
                                    "Shoppers queried this unavailable item via search.",
                                    "Restock item for store: " + (sp.getStore() != null ? sp.getStore().getName() : "Local Store")
                            ));

                    log.setMissedSearchesCount(log.getMissedSearchesCount() + 1);
                    log.setEstimatedMissedRevenue(log.getMissedSearchesCount() * sp.getPrice());
                    demandLogRepository.save(log);
                }
            });
        }
    }
}
