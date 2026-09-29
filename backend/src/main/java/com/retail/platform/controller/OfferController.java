package com.retail.platform.controller;

import com.retail.platform.model.Offer;
import com.retail.platform.repository.OfferRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores/{storeId}/offers")
@CrossOrigin(origins = "*")
public class OfferController {

    private final OfferRepository offerRepository;

    public OfferController(OfferRepository offerRepository) {
        this.offerRepository = offerRepository;
    }

    @GetMapping
    public List<Offer> getActiveOffers(@PathVariable Long storeId) {
        return offerRepository.findByStoreIdAndIsActiveTrue(storeId);
    }

    @GetMapping("/all")
    public List<Offer> getAllOffers(@PathVariable Long storeId) {
        return offerRepository.findByStoreId(storeId);
    }

    @PostMapping
    public Offer createOffer(@PathVariable Long storeId, @RequestBody Offer offer) {
        return offerRepository.save(offer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateOffer(@PathVariable Long storeId, @PathVariable Long id) {
        offerRepository.findById(id).ifPresent(offer -> {
            offer.setIsActive(false);
            offerRepository.save(offer);
        });
        return ResponseEntity.noContent().build();
    }
}
