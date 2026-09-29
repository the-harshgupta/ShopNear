package com.retail.platform.controller;

import com.retail.platform.model.Role;
import com.retail.platform.model.Store;
import com.retail.platform.model.User;
import com.retail.platform.repository.ProductRepository;
import com.retail.platform.repository.SaleRepository;
import com.retail.platform.repository.StoreRepository;
import com.retail.platform.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;

    public AdminController(UserRepository userRepository, StoreRepository storeRepository, ProductRepository productRepository, SaleRepository saleRepository) {
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
    }

    @GetMapping("/users")
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("fullName", u.getFullName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole().name());
            map.put("phone", u.getPhone());
            map.put("createdAt", u.getCreatedAt());
            return map;
        }).collect(Collectors.toList());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String newRoleStr = payload.get("role");
        if (newRoleStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Role is required"));
        }

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        user.setRole(Role.fromString(newRoleStr));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
        ));
    }

    @GetMapping("/stores")
    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    @GetMapping("/stats")
    public Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalStores", storeRepository.count());
        stats.put("totalProducts", productRepository.count());
        stats.put("totalSalesCount", saleRepository.count());
        stats.put("systemStatus", "ONLINE");
        stats.put("databaseMode", "H2 / MySQL");
        return stats;
    }
}
