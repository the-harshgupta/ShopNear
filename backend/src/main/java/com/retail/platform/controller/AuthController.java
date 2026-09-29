package com.retail.platform.controller;

import com.retail.platform.config.JwtTokenProvider;
import com.retail.platform.model.Role;
import com.retail.platform.model.Store;
import com.retail.platform.model.User;
import com.retail.platform.repository.StoreRepository;
import com.retail.platform.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserRepository userRepository, StoreRepository storeRepository, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.tokenProvider = tokenProvider;
    }

    private Map<String, Object> mapStoreToResponse(Store store) {
        if (store == null) return null;
        Map<String, Object> storeMap = new HashMap<>();
        storeMap.put("id", store.getId());
        storeMap.put("name", store.getName());
        storeMap.put("type", store.getType() != null ? store.getType().name() : "KIRANA_STORE");
        storeMap.put("storeType", store.getType() != null ? store.getType().name() : "KIRANA_STORE");
        storeMap.put("ownerName", store.getOwnerName());
        storeMap.put("address", store.getAddress());
        storeMap.put("city", store.getCity());
        storeMap.put("state", store.getState());
        storeMap.put("pincode", store.getPincode());
        storeMap.put("phone", store.getPhone());
        storeMap.put("email", store.getEmail());
        storeMap.put("description", store.getDescription());
        storeMap.put("distance", "0.4 km away");
        storeMap.put("timings", "7:00 AM - 10:30 PM");
        return storeMap;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        String selectedRole = credentials.get("selectedRole");
        if (selectedRole == null) {
            selectedRole = credentials.get("role");
        }

        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase());
        if (userOpt.isPresent() && userOpt.get().getPassword().trim().equals(password.trim())) {
            User user = userOpt.get();

            // Strict Backend Role Verification
            if (selectedRole != null && !selectedRole.isBlank()) {
                Role requestedRole = Role.fromString(selectedRole);
                boolean roleMatches = (user.getRole() == requestedRole) ||
                        (user.getRole() == Role.SUPERMARKET_MANAGER && requestedRole == Role.STORE_MANAGER) ||
                        (user.getRole() == Role.STORE_MANAGER && requestedRole == Role.SUPERMARKET_MANAGER);

                if (!roleMatches) {
                    return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials: This account is not registered as a " + requestedRole.name() + "."));
                }
            }

            Long storeId = null;
            String storeName = null;
            String storeType = null;
            Map<String, Object> storeMap = null;

            List<Store> ownedStores = storeRepository.findByOwnerId(user.getId());
            if (!ownedStores.isEmpty()) {
                Store primaryStore = ownedStores.get(0);
                storeId = primaryStore.getId();
                storeName = primaryStore.getName();
                storeType = primaryStore.getType().name();
                storeMap = mapStoreToResponse(primaryStore);
            }

            String token = tokenProvider.generateToken(user, storeId);

            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("fullName", user.getFullName());
            userMap.put("name", user.getFullName());
            userMap.put("email", user.getEmail());
            userMap.put("role", user.getRole().name());
            userMap.put("phone", user.getPhone() != null ? user.getPhone() : "");
            if (storeId != null) {
                userMap.put("storeId", storeId);
                userMap.put("storeName", storeName);
                userMap.put("storeType", storeType);
                userMap.put("store", storeMap);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", userMap);

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password."));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> payload) {
        String fullName = (String) payload.get("fullName");
        if (fullName == null || fullName.isBlank()) {
            fullName = (String) payload.get("name");
        }
        String email = (String) payload.get("email");
        String password = (String) payload.get("password");
        String roleStr = (String) payload.get("role");
        String phone = (String) payload.get("phone");
        String storeName = (String) payload.get("storeName");
        String storeAddress = (String) payload.get("storeAddress");

        if (email == null || password == null || fullName == null || email.isBlank() || password.isBlank() || fullName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Full name, email, and password are required"));
        }

        String normalizedEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email address is already registered. Please login instead."));
        }

        Role assignedRole = Role.fromString(roleStr);

        // Security check: Public registration cannot claim ADMIN role
        if (assignedRole == Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin accounts cannot be created through public registration."));
        }

        User newUser = new User(fullName.trim(), normalizedEmail, password, assignedRole, phone != null ? phone.trim() : "");
        User savedUser = userRepository.save(newUser);

        Long storeId = null;
        String storeTypeName = null;
        Map<String, Object> storeMap = null;

        // Auto-create store if shopkeeper or supermarket manager
        if (assignedRole == Role.SHOPKEEPER || assignedRole == Role.SUPERMARKET_MANAGER || assignedRole == Role.STORE_MANAGER) {
            com.retail.platform.model.StoreType type = (assignedRole == Role.SHOPKEEPER) 
                ? com.retail.platform.model.StoreType.KIRANA_STORE 
                : com.retail.platform.model.StoreType.SUPERMARKET;

            String resolvedStoreName = (storeName != null && !storeName.isBlank()) 
                ? storeName.trim() 
                : (fullName.trim() + "'s " + (assignedRole == Role.SHOPKEEPER ? "Kirana Store" : "Supermarket"));

            Store newStore = new Store(
                resolvedStoreName,
                type,
                savedUser.getFullName(),
                storeAddress != null ? storeAddress.trim() : "Main Market Area",
                phone != null ? phone.trim() : ""
            );
            newStore.setOwner(savedUser);
            Store savedStore = storeRepository.save(newStore);
            storeId = savedStore.getId();
            storeName = savedStore.getName();
            storeTypeName = savedStore.getType().name();
            storeMap = mapStoreToResponse(savedStore);
        }

        String token = tokenProvider.generateToken(savedUser, storeId);

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", savedUser.getId());
        userMap.put("fullName", savedUser.getFullName());
        userMap.put("name", savedUser.getFullName());
        userMap.put("email", savedUser.getEmail());
        userMap.put("role", savedUser.getRole().name());
        userMap.put("phone", savedUser.getPhone());
        if (storeId != null) {
            userMap.put("storeId", storeId);
            userMap.put("storeName", storeName);
            userMap.put("storeType", storeTypeName);
            userMap.put("store", storeMap);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", userMap);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication token missing"));
        }

        String token = authHeader.substring(7).trim();
        if (!tokenProvider.validateToken(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired token"));
        }

        Long userId = tokenProvider.getUserId(token);
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token claims"));
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("fullName", user.getFullName());
        userMap.put("name", user.getFullName());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole().name());
        userMap.put("phone", user.getPhone() != null ? user.getPhone() : "");

        List<Store> ownedStores = storeRepository.findByOwnerId(user.getId());
        if (!ownedStores.isEmpty()) {
            Store primaryStore = ownedStores.get(0);
            userMap.put("storeId", primaryStore.getId());
            userMap.put("storeName", primaryStore.getName());
            userMap.put("storeType", primaryStore.getType().name());
            userMap.put("store", mapStoreToResponse(primaryStore));
        }

        return ResponseEntity.ok(Map.of("user", userMap));
    }
}
