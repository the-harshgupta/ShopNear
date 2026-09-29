package com.retail.platform.repository;

import com.retail.platform.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByCustomerIdAndStoreId(Long customerId, Long storeId);

    List<Cart> findByCustomerId(Long customerId);

    void deleteByCustomerIdAndStoreId(Long customerId, Long storeId);
}
