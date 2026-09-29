package com.retail.platform.service;

import com.retail.platform.model.*;
import com.retail.platform.repository.SaleRepository;
import com.retail.platform.repository.StoreProductRepository;
import com.retail.platform.repository.StoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final StoreRepository storeRepository;
    private final StoreProductRepository storeProductRepository;

    public SaleService(SaleRepository saleRepository,
                       StoreRepository storeRepository,
                       StoreProductRepository storeProductRepository) {
        this.saleRepository = saleRepository;
        this.storeRepository = storeRepository;
        this.storeProductRepository = storeProductRepository;
    }

    public List<Sale> getSalesByStore(Long storeId) {
        return saleRepository.findByStoreIdOrderBySaleDateDesc(storeId);
    }

    public List<Sale> getTodaySales(Long storeId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return saleRepository.findByStoreIdAndSaleDateAfter(storeId, startOfDay);
    }

    public Double getTodaysRevenue(Long storeId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return saleRepository.sumTotalByStoreIdSince(storeId, startOfDay);
    }

    /**
     * Record a sale: create Sale with SaleItems, decrement stock for each item.
     */
    @Transactional
    public Sale recordSale(Long storeId, Sale saleRequest) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found: " + storeId));

        if (saleRequest.getItems() == null || saleRequest.getItems().isEmpty()) {
            throw new IllegalArgumentException("Sale must contain at least one item");
        }

        // Pass 1: Validate stock for all items
        for (SaleItem itemRequest : saleRequest.getItems()) {
            Long spId = itemRequest.getStoreProduct() != null ? itemRequest.getStoreProduct().getId() : null;
            if (spId == null) {
                throw new IllegalArgumentException("Store product ID is missing in sale item");
            }
            StoreProduct sp = storeProductRepository.findById(spId)
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + spId));

            if (sp.getStockQuantity() < itemRequest.getQuantity()) {
                String pName = sp.getProduct() != null ? sp.getProduct().getName() : "Item #" + spId;
                throw new IllegalArgumentException("Insufficient stock for " + pName + ". Only " + sp.getStockQuantity() + " items are available.");
            }
        }

        Sale sale = new Sale();
        sale.setStore(store);
        sale.setCustomerName(saleRequest.getCustomerName() != null ? saleRequest.getCustomerName() : "Walk-in Customer");
        sale.setCustomerPhone(saleRequest.getCustomerPhone() != null ? saleRequest.getCustomerPhone() : "");

        // Pass 2: Deduct stock and populate sale items
        for (SaleItem itemRequest : saleRequest.getItems()) {
            StoreProduct sp = storeProductRepository.findById(itemRequest.getStoreProduct().getId()).get();

            // Decrement stock
            int newStock = sp.getStockQuantity() - itemRequest.getQuantity();
            sp.setStockQuantity(Math.max(0, newStock));
            storeProductRepository.save(sp);

            // Create sale item
            SaleItem saleItem = new SaleItem(sp, itemRequest.getQuantity());
            saleItem.setSale(sale);
            sale.getItems().add(saleItem);
        }

        sale.recalculateTotal();
        return saleRepository.save(sale);
    }

    public long countByStore(Long storeId) {
        return saleRepository.countByStoreId(storeId);
    }
}
