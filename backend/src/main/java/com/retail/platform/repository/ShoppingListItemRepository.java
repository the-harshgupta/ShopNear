package com.retail.platform.repository;

import com.retail.platform.model.ShoppingListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShoppingListItemRepository extends JpaRepository<ShoppingListItem, Long> {
    List<ShoppingListItem> findByUserId(Long userId);
    void deleteByUserIdAndIsPurchasedTrue(Long userId);
}
