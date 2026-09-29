package com.retail.platform.repository;

import com.retail.platform.model.Store;
import com.retail.platform.model.StoreType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findByType(StoreType type);

    List<Store> findByIsActiveTrue();

    List<Store> findByOwnerId(Long ownerId);

    @Query("SELECT s FROM Store s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Store> searchByName(String query);
}
