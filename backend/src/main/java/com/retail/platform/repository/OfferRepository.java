package com.retail.platform.repository;

import com.retail.platform.model.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByStoreIdAndIsActiveTrue(Long storeId);

    List<Offer> findByStoreProductId(Long storeProductId);

    List<Offer> findByStoreId(Long storeId);
}
