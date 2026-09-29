package com.retail.platform.service;

import com.retail.platform.model.*;
import com.retail.platform.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AiInventoryAssistantService {

    private final StoreRepository storeRepository;
    private final StoreProductRepository storeProductRepository;
    private final StoreProductService storeProductService;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SaleService saleService;
    private final AiAuditLogRepository aiAuditLogRepository;
    private final UserRepository userRepository;
    private final ProductImageSearchService productImageSearchService;
    private final FileStorageService fileStorageService;

    // Conversational & grammatical stop words that must never trigger fuzzy product matching
    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "ko", "kar", "karo", "kardo", "do", "dalo", "daal", "mere", "meri", "mera", "inventory",
            "mein", "me", "se", "ka", "ki", "ke", "hai", "kya", "bhi", "aur", "pe", "par",
            "add", "increase", "remove", "delete", "hatao", "hata", "badhao", "ghatao", "kam",
            "please", "store", "dukan", "shop", "item", "product", "naya", "new", "create",
            "packet", "packets", "pkt", "unit", "units", "piece", "pieces", "pcs", "box", "boxes",
            "gm", "gram", "grams", "kg", "ml", "litre", "liter", "l",
            "of", "in", "to", "for", "from", "the", "and", "a", "an", "is", "at", "by", "with",
            "price", "rate", "rupee", "rupees", "rs"
    ));

    // Recognized Indian retail brands to differentiate generic staples from brand-specific queries
    private static final Set<String> KNOWN_BRANDS = new HashSet<>(Arrays.asList(
            "amul", "mother dairy", "britannia", "milky mist", "tata", "fortune", "aashirvaad",
            "saffola", "parle", "parle-g", "nestle", "cadbury", "dettol", "dove", "colgate", "pepsodent",
            "sensodyne", "lifebuoy", "lux", "clinic plus", "sunfeast", "oreo", "india gate",
            "daawat", "patanjali", "kurkure", "lays", "haldiram", "everest", "mdh", "catch",
            "dabur", "nandini", "country delight", "dhara", "gemini", "taj mahal", "red label",
            "wagh bakri", "bru", "nescafe", "gowardhan", "pillsbury", "nature fresh",
            "coca cola", "coca-cola", "pepsi", "surf excel", "ariel", "rin", "tide", "vim",
            "thums up", "sprite", "limca", "fanta", "frooti", "maaza", "slice", "mirinda",
            "bournvita", "horlicks", "boost", "complan", "kissan", "maggi"
    ));

    // Curated brand variants for generic staple terms
    private static final Map<String, List<Map<String, Object>>> GENERIC_STAPLE_MAP = new HashMap<>();

    static {
        // Butter variants
        List<Map<String, Object>> butterVariants = List.of(
                Map.of("name", "Amul Butter", "brand", "Amul", "package", "100g", "packageQuantity", 100.0, "unit", "GRAM", "category", "Dairy", "defaultPrice", 60.0, "defaultStock", 20),
                Map.of("name", "Mother Dairy Butter", "brand", "Mother Dairy", "package", "100g", "packageQuantity", 100.0, "unit", "GRAM", "category", "Dairy", "defaultPrice", 58.0, "defaultStock", 20),
                Map.of("name", "Britannia Butter", "brand", "Britannia", "package", "100g", "packageQuantity", 100.0, "unit", "GRAM", "category", "Dairy", "defaultPrice", 55.0, "defaultStock", 20),
                Map.of("name", "Milky Mist Butter", "brand", "Milky Mist", "package", "100g", "packageQuantity", 100.0, "unit", "GRAM", "category", "Dairy", "defaultPrice", 62.0, "defaultStock", 20)
        );
        GENERIC_STAPLE_MAP.put("butter", butterVariants);
        GENERIC_STAPLE_MAP.put("makhan", butterVariants);
        GENERIC_STAPLE_MAP.put("makkhan", butterVariants);

        // Milk variants
        List<Map<String, Object>> milkVariants = List.of(
                Map.of("name", "Amul Taaza Milk", "brand", "Amul", "package", "500ml", "packageQuantity", 500.0, "unit", "ML", "category", "Dairy", "defaultPrice", 28.0, "defaultStock", 30),
                Map.of("name", "Mother Dairy Toned Milk", "brand", "Mother Dairy", "package", "500ml", "packageQuantity", 500.0, "unit", "ML", "category", "Dairy", "defaultPrice", 28.0, "defaultStock", 25),
                Map.of("name", "Nandini Toned Milk", "brand", "Nandini", "package", "500ml", "packageQuantity", 500.0, "unit", "ML", "category", "Dairy", "defaultPrice", 24.0, "defaultStock", 25),
                Map.of("name", "Country Delight Cow Milk", "brand", "Country Delight", "package", "500ml", "packageQuantity", 500.0, "unit", "ML", "category", "Dairy", "defaultPrice", 38.0, "defaultStock", 20)
        );
        GENERIC_STAPLE_MAP.put("milk", milkVariants);
        GENERIC_STAPLE_MAP.put("doodh", milkVariants);
        GENERIC_STAPLE_MAP.put("dudh", milkVariants);

        // Ghee variants
        List<Map<String, Object>> gheeVariants = List.of(
                Map.of("name", "Amul Pure Desi Ghee", "brand", "Amul", "package", "1L", "packageQuantity", 1.0, "unit", "LITRE", "category", "Dairy", "defaultPrice", 580.0, "defaultStock", 15),
                Map.of("name", "Mother Dairy Desi Ghee", "brand", "Mother Dairy", "package", "1L", "packageQuantity", 1.0, "unit", "LITRE", "category", "Dairy", "defaultPrice", 590.0, "defaultStock", 15),
                Map.of("name", "Aashirvaad Svasti Ghee", "brand", "Aashirvaad", "package", "1L", "packageQuantity", 1.0, "unit", "LITRE", "category", "Dairy", "defaultPrice", 610.0, "defaultStock", 12),
                Map.of("name", "Patanjali Cow Ghee", "brand", "Patanjali", "package", "1L", "packageQuantity", 1.0, "unit", "LITRE", "category", "Dairy", "defaultPrice", 560.0, "defaultStock", 15)
        );
        GENERIC_STAPLE_MAP.put("ghee", gheeVariants);

        // Salt variants
        List<Map<String, Object>> saltVariants = List.of(
                Map.of("name", "Tata Salt", "brand", "Tata", "package", "1kg", "packageQuantity", 1.0, "unit", "KG", "category", "Grocery & Staples", "defaultPrice", 28.0, "defaultStock", 40),
                Map.of("name", "Aashirvaad Iodized Salt", "brand", "Aashirvaad", "package", "1kg", "packageQuantity", 1.0, "unit", "KG", "category", "Grocery & Staples", "defaultPrice", 26.0, "defaultStock", 30),
                Map.of("name", "Catch Table Salt", "brand", "Catch", "package", "200g", "packageQuantity", 200.0, "unit", "GRAM", "category", "Grocery & Staples", "defaultPrice", 35.0, "defaultStock", 25),
                Map.of("name", "Saffola Salt", "brand", "Saffola", "package", "1kg", "packageQuantity", 1.0, "unit", "KG", "category", "Grocery & Staples", "defaultPrice", 32.0, "defaultStock", 20)
        );
        GENERIC_STAPLE_MAP.put("salt", saltVariants);
        GENERIC_STAPLE_MAP.put("namak", saltVariants);

        // Atta variants
        List<Map<String, Object>> attaVariants = List.of(
                Map.of("name", "Aashirvaad Shudh Chakki Atta", "brand", "Aashirvaad", "package", "5kg", "packageQuantity", 5.0, "unit", "KG", "category", "Grocery & Staples", "defaultPrice", 230.0, "defaultStock", 20),
                Map.of("name", "Fortune Chakki Fresh Atta", "brand", "Fortune", "package", "5kg", "packageQuantity", 5.0, "unit", "KG", "category", "Grocery & Staples", "defaultPrice", 210.0, "defaultStock", 20),
                Map.of("name", "Pillsbury Chakki Fresh Atta", "brand", "Pillsbury", "package", "5kg", "packageQuantity", 5.0, "unit", "KG", "category", "Grocery & Staples", "defaultPrice", 225.0, "defaultStock", 15),
                Map.of("name", "Nature Fresh Sampoorna Atta", "brand", "Nature Fresh", "package", "5kg", "packageQuantity", 5.0, "unit", "KG", "category", "Grocery & Staples", "defaultPrice", 205.0, "defaultStock", 15)
        );
        GENERIC_STAPLE_MAP.put("atta", attaVariants);
        GENERIC_STAPLE_MAP.put("flour", attaVariants);
        GENERIC_STAPLE_MAP.put("gehu", attaVariants);

        // Cooking Oil variants
        List<Map<String, Object>> oilVariants = List.of(
                Map.of("name", "Fortune Sunflower Oil", "brand", "Fortune", "package", "1L", "packageQuantity", 1.0, "unit", "LITRE", "category", "Oils & Masalas", "defaultPrice", 145.0, "defaultStock", 25),
                Map.of("name", "Saffola Gold Pro Healthy Oil", "brand", "Saffola", "package", "1L", "packageQuantity", 1.0, "unit", "LITRE", "category", "Oils & Masalas", "defaultPrice", 175.0, "defaultStock", 20),
                Map.of("name", "Dhara Mustard Oil", "brand", "Dhara", "package", "1L", "packageQuantity", 1.0, "unit", "LITRE", "category", "Oils & Masalas", "defaultPrice", 160.0, "defaultStock", 20),
                Map.of("name", "Gemini Pure Sunflower Oil", "brand", "Gemini", "package", "1L", "packageQuantity", 1.0, "unit", "LITRE", "category", "Oils & Masalas", "defaultPrice", 140.0, "defaultStock", 20)
        );
        GENERIC_STAPLE_MAP.put("oil", oilVariants);
        GENERIC_STAPLE_MAP.put("tel", oilVariants);

        // Rice variants
        List<Map<String, Object>> riceVariants = List.of(
                Map.of("name", "India Gate Basmati Rice", "brand", "India Gate", "package", "1kg", "packageQuantity", 1.0, "unit", "KG", "category", "Grocery & Staples", "defaultPrice", 95.0, "defaultStock", 25),
                Map.of("name", "Daawat Rozana Basmati Rice", "brand", "Daawat", "package", "1kg", "packageQuantity", 1.0, "unit", "KG", "category", "Grocery & Staples", "defaultPrice", 85.0, "defaultStock", 25),
                Map.of("name", "Fortune Everyday Basmati Rice", "brand", "Fortune", "package", "1kg", "packageQuantity", 1.0, "unit", "KG", "category", "Grocery & Staples", "defaultPrice", 80.0, "defaultStock", 20),
                Map.of("name", "Kohinoor Super Silver Basmati Rice", "brand", "Kohinoor", "package", "1kg", "packageQuantity", 1.0, "unit", "KG", "category", "Grocery & Staples", "defaultPrice", 120.0, "defaultStock", 15)
        );
        GENERIC_STAPLE_MAP.put("rice", riceVariants);
        GENERIC_STAPLE_MAP.put("chawal", riceVariants);
        GENERIC_STAPLE_MAP.put("basmati", riceVariants);

        // Paneer variants
        List<Map<String, Object>> paneerVariants = List.of(
                Map.of("name", "Amul Fresh Malai Paneer", "brand", "Amul", "package", "200g", "packageQuantity", 200.0, "unit", "GRAM", "category", "Dairy", "defaultPrice", 90.0, "defaultStock", 20),
                Map.of("name", "Mother Dairy Classic Paneer", "brand", "Mother Dairy", "package", "200g", "packageQuantity", 200.0, "unit", "GRAM", "category", "Dairy", "defaultPrice", 88.0, "defaultStock", 20),
                Map.of("name", "Milky Mist Paneer", "brand", "Milky Mist", "package", "200g", "packageQuantity", 200.0, "unit", "GRAM", "category", "Dairy", "defaultPrice", 95.0, "defaultStock", 15),
                Map.of("name", "Gowardhan Fresh Paneer", "brand", "Gowardhan", "package", "200g", "packageQuantity", 200.0, "unit", "GRAM", "category", "Dairy", "defaultPrice", 92.0, "defaultStock", 15)
        );
        GENERIC_STAPLE_MAP.put("paneer", paneerVariants);

        // Soap variants
        List<Map<String, Object>> soapVariants = List.of(
                Map.of("name", "Dettol Original Soap", "brand", "Dettol", "package", "125g", "packageQuantity", 125.0, "unit", "GRAM", "category", "Personal Care", "defaultPrice", 45.0, "defaultStock", 30),
                Map.of("name", "Lifebuoy Total Soap", "brand", "Lifebuoy", "package", "125g", "packageQuantity", 125.0, "unit", "GRAM", "category", "Personal Care", "defaultPrice", 35.0, "defaultStock", 30),
                Map.of("name", "Dove Beauty Cream Soap", "brand", "Dove", "package", "100g", "packageQuantity", 100.0, "unit", "GRAM", "category", "Personal Care", "defaultPrice", 65.0, "defaultStock", 20),
                Map.of("name", "Lux Velvet Touch Soap", "brand", "Lux", "package", "100g", "packageQuantity", 100.0, "unit", "GRAM", "category", "Personal Care", "defaultPrice", 38.0, "defaultStock", 25)
        );
        GENERIC_STAPLE_MAP.put("soap", soapVariants);
        GENERIC_STAPLE_MAP.put("sabun", soapVariants);

        // Biscuits variants
        List<Map<String, Object>> biscuitVariants = List.of(
                Map.of("name", "Parle-G Gluco Biscuits", "brand", "Parle", "package", "250g", "packageQuantity", 250.0, "unit", "GRAM", "category", "Snacks & Instant Food", "defaultPrice", 25.0, "defaultStock", 40),
                Map.of("name", "Britannia Good Day Cashew", "brand", "Britannia", "package", "200g", "packageQuantity", 200.0, "unit", "GRAM", "category", "Snacks & Instant Food", "defaultPrice", 35.0, "defaultStock", 30),
                Map.of("name", "Sunfeast Dark Fantasy", "brand", "Sunfeast", "package", "300g", "packageQuantity", 300.0, "unit", "GRAM", "category", "Snacks & Instant Food", "defaultPrice", 90.0, "defaultStock", 20),
                Map.of("name", "Oreo Vanilla Creme", "brand", "Cadbury", "package", "120g", "packageQuantity", 120.0, "unit", "GRAM", "category", "Snacks & Instant Food", "defaultPrice", 30.0, "defaultStock", 25)
        );
        GENERIC_STAPLE_MAP.put("biscuit", biscuitVariants);
        GENERIC_STAPLE_MAP.put("biscuits", biscuitVariants);

        // Noodles variants
        List<Map<String, Object>> noodleVariants = List.of(
                Map.of("name", "Maggi 2-Minute Masala Noodles", "brand", "Nestle", "package", "70g", "packageQuantity", 70.0, "unit", "GRAM", "category", "Snacks & Instant Food", "defaultPrice", 14.0, "defaultStock", 50),
                Map.of("name", "Yippee Magic Masala Noodles", "brand", "Sunfeast", "package", "65g", "packageQuantity", 65.0, "unit", "GRAM", "category", "Snacks & Instant Food", "defaultPrice", 12.0, "defaultStock", 30),
                Map.of("name", "Top Ramen Curry Veg Noodles", "brand", "Nissin", "package", "70g", "packageQuantity", 70.0, "unit", "GRAM", "category", "Snacks & Instant Food", "defaultPrice", 14.0, "defaultStock", 25),
                Map.of("name", "Ching's Secret Schezwan Noodles", "brand", "Ching's", "package", "60g", "packageQuantity", 60.0, "unit", "GRAM", "category", "Snacks & Instant Food", "defaultPrice", 15.0, "defaultStock", 20)
        );
        GENERIC_STAPLE_MAP.put("noodles", noodleVariants);
        GENERIC_STAPLE_MAP.put("noodle", noodleVariants);
        GENERIC_STAPLE_MAP.put("maggi", noodleVariants);
    }

    public AiInventoryAssistantService(
            StoreRepository storeRepository,
            StoreProductRepository storeProductRepository,
            StoreProductService storeProductService,
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            SaleService saleService,
            AiAuditLogRepository aiAuditLogRepository,
            UserRepository userRepository,
            ProductImageSearchService productImageSearchService,
            FileStorageService fileStorageService) {
        this.storeRepository = storeRepository;
        this.storeProductRepository = storeProductRepository;
        this.storeProductService = storeProductService;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.saleService = saleService;
        this.aiAuditLogRepository = aiAuditLogRepository;
        this.userRepository = userRepository;
        this.productImageSearchService = productImageSearchService;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Resolves the authenticated user's store with strict zero-trust validation.
     */
    public Store resolveAuthenticatedStore(Long userId, Role role, Long tokenStoreId) {
        if (userId == null) {
            throw new SecurityException("Unauthorized: No authenticated user identity.");
        }

        List<Store> ownedStores = storeRepository.findByOwnerId(userId);
        if (!ownedStores.isEmpty()) {
            return ownedStores.get(0);
        }

        if (tokenStoreId != null) {
            Optional<Store> storeOpt = storeRepository.findById(tokenStoreId);
            if (storeOpt.isPresent()) {
                Store s = storeOpt.get();
                if (role == Role.ADMIN || (s.getOwner() != null && s.getOwner().getId().equals(userId))) {
                    return s;
                }
            }
        }

        if (role == Role.ADMIN) {
            List<Store> all = storeRepository.findAll();
            if (!all.isEmpty()) return all.get(0);
        }

        throw new SecurityException("Access Denied: No store registered or assigned to your account.");
    }

    /**
     * Parse natural language command and formulate response / pending action.
     */
    public Map<String, Object> processCommand(String rawCommand, Long userId, Role role, Long tokenStoreId) {
        if (rawCommand == null || rawCommand.trim().isEmpty()) {
            return Map.of("type", "MESSAGE", "reply", "Please type or speak a command (e.g. \"Butter ko add kar do mere inventory mein\").");
        }

        Store store = resolveAuthenticatedStore(userId, role, tokenStoreId);
        String command = normalizeText(rawCommand);

        // Security check: Check if user attempted to target a different store
        List<Store> allOtherStores = storeRepository.findAll().stream()
                .filter(s -> !s.getId().equals(store.getId()))
                .collect(Collectors.toList());
        for (Store other : allOtherStores) {
            if (command.toLowerCase().contains(other.getName().toLowerCase())) {
                return Map.of(
                        "type", "SECURITY_ALERT",
                        "reply", "I can only manage inventory for your registered store (\"" + store.getName() + "\")."
                );
            }
        }

        // 1. INVENTORY QUESTIONS (Read-Only: No confirmation required)
        if (isSummaryQuery(command)) {
            return handleInventorySummary(store);
        }

        if (isLowStockQuery(command)) {
            return handleLowStockQuery(store);
        }

        if (isOutOfStockQuery(command)) {
            return handleOutOfStockQuery(store);
        }

        if (isStockQuestion(command)) {
            return handleProductStockQuestion(command, store);
        }

        // 2. MUTATION COMMANDS (Require confirmation)
        // Check Product Photo Search or Update Command ("Find photos for Amul Butter")
        if (isPhotoCommand(command)) {
            return handlePhotoCommand(command, store);
        }

        // Check Delete Command ("Maggi delete kar do")
        if (isDeleteCommand(command)) {
            return handleDeleteCommand(command, store);
        }

        // Check Update Price Command ("Change Amul Milk price to ₹34")
        if (isUpdatePriceCommand(command)) {
            return handleUpdatePriceCommand(command, store);
        }

        // Check Update Location Command ("Set location of Amul Milk to Aisle 1")
        if (isUpdateLocationCommand(command)) {
            return handleUpdateLocationCommand(command, store);
        }

        // Check Update Product Info (category or name)
        if (isUpdateProductInfoCommand(command)) {
            return handleUpdateProductInfoCommand(command, store);
        }

        // Check Sale Record Command ("I sold 8 Tata Salt")
        if (isSaleCommand(command)) {
            return handleSaleCommand(command, store);
        }

        // Check Add or Creation or Stock Adjustment Command (Add, Create, Daal, Jodo, Naya Product, etc.)
        if (isAddOrStockCommand(command)) {
            return handleAddOrStockCommand(command, store);
        }

        // Check Stock Reduction Command (Remove, decrease, ghatao, kam karo)
        if (isStockReductionCommand(command)) {
            return handleStockAdjustmentCommand(command, store, false);
        }

        // Fallback: Product search or general assistance
        return handleGeneralSearch(command, store);
    }

    // =========================================================================
    // QUERY HANDLERS (READ-ONLY)
    // =========================================================================

    private Map<String, Object> handleInventorySummary(Store store) {
        List<StoreProduct> products = storeProductRepository.findByStoreId(store.getId());
        int totalProducts = products.size();
        int totalUnits = products.stream().mapToInt(StoreProduct::getStockQuantity).sum();
        long lowStockCount = products.stream().filter(p -> p.getStockQuantity() > 0 && p.getStockQuantity() <= p.getLowStockThreshold()).count();
        long outOfStockCount = products.stream().filter(p -> p.getStockQuantity() == 0).count();

        String reply = String.format(
                "You have %d registered products in %s:\n• Total stock units: %d\n• Low stock alerts: %d\n• Out of stock: %d",
                totalProducts, store.getName(), totalUnits, lowStockCount, outOfStockCount
        );

        return Map.of(
                "type", "MESSAGE",
                "intent", "GET_INVENTORY_SUMMARY",
                "reply", reply,
                "summary", Map.of(
                        "totalProducts", totalProducts,
                        "totalUnits", totalUnits,
                        "lowStockCount", lowStockCount,
                        "outOfStockCount", outOfStockCount
                )
        );
    }

    private Map<String, Object> handleLowStockQuery(Store store) {
        List<StoreProduct> lowStock = storeProductRepository.findLowStockByStoreId(store.getId());
        if (lowStock.isEmpty()) {
            return Map.of(
                    "type", "MESSAGE",
                    "intent", "GET_LOW_STOCK",
                    "reply", "Great news! You currently have 0 low-stock products in " + store.getName() + ". All items have healthy levels."
            );
        }

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("You currently have %d low-stock product%s:\n\n", lowStock.size(), lowStock.size() > 1 ? "s" : ""));
        for (int i = 0; i < lowStock.size(); i++) {
            StoreProduct sp = lowStock.get(i);
            sb.append(String.format("%d. %s — %d unit%s (Min: %d)\n",
                    i + 1, sp.getProduct().getName(), sp.getStockQuantity(), sp.getStockQuantity() > 1 ? "s" : "", sp.getLowStockThreshold()));
        }

        return Map.of(
                "type", "MESSAGE",
                "intent", "GET_LOW_STOCK",
                "reply", sb.toString().trim(),
                "items", lowStock.stream().map(sp -> Map.of(
                        "id", sp.getId(),
                        "name", sp.getProduct().getName(),
                        "stock", sp.getStockQuantity(),
                        "threshold", sp.getLowStockThreshold()
                )).collect(Collectors.toList())
        );
    }

    private Map<String, Object> handleOutOfStockQuery(Store store) {
        List<StoreProduct> outOfStock = storeProductRepository.findOutOfStockByStoreId(store.getId());
        if (outOfStock.isEmpty()) {
            return Map.of(
                    "type", "MESSAGE",
                    "intent", "GET_OUT_OF_STOCK",
                    "reply", "You have 0 out-of-stock products in " + store.getName() + ". All items are currently available."
            );
        }

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("You have %d product%s completely out of stock:\n\n", outOfStock.size(), outOfStock.size() > 1 ? "s" : ""));
        for (int i = 0; i < outOfStock.size(); i++) {
            StoreProduct sp = outOfStock.get(i);
            sb.append(String.format("%d. %s (₹%.0f)\n", i + 1, sp.getProduct().getName(), sp.getPrice()));
        }
        sb.append("\nSay \"Add [quantity] [Product]\" to replenish stock.");

        return Map.of(
                "type", "MESSAGE",
                "intent", "GET_OUT_OF_STOCK",
                "reply", sb.toString().trim(),
                "items", outOfStock.stream().map(sp -> Map.of(
                        "id", sp.getId(),
                        "name", sp.getProduct().getName(),
                        "price", sp.getPrice()
                )).collect(Collectors.toList())
        );
    }

    private Map<String, Object> handleProductStockQuestion(String command, Store store) {
        String cleanQuery = extractProductNameFromStockQuery(command);
        List<StoreProduct> matches = findMatchingStoreProducts(cleanQuery, store.getId());

        if (matches.isEmpty()) {
            return Map.of(
                    "type", "NOT_FOUND",
                    "reply", "I couldn't find \"" + cleanQuery + "\" in your inventory.\n\nWould you like to add it as a new product?",
                    "suggestedProduct", cleanQuery
            );
        }

        if (matches.size() > 1 && !isExactMatch(matches, cleanQuery)) {
            return buildDisambiguationResponse(matches, cleanQuery, "GET_PRODUCT_STOCK", 0, "INSPECT");
        }

        StoreProduct sp = matches.get(0);
        String status = sp.getStockQuantity() == 0 ? "Out of Stock" :
                sp.getStockQuantity() <= sp.getLowStockThreshold() ? "Low Stock" : "Healthy";

        String reply = String.format(
                "%s\n\nCurrent stock: %d units\nPrice: ₹%.2f\nStatus: %s",
                sp.getProduct().getName(), sp.getStockQuantity(), sp.getPrice(), status
        );

        return Map.of(
                "type", "MESSAGE",
                "intent", "GET_PRODUCT_STOCK",
                "reply", reply,
                "product", Map.of(
                        "id", sp.getId(),
                        "name", sp.getProduct().getName(),
                        "stock", sp.getStockQuantity(),
                        "price", sp.getPrice(),
                        "status", status
                )
        );
    }

    // =========================================================================
    // ADD & CREATION COMMAND ROUTING (CORE WORKFLOW)
    // =========================================================================

    /**
     * Unified handler for Adding products, creating new products, and stock replenishment.
     * Guaranteed zero random selection of unrelated products (e.g. Dove Shampoo for Butter).
     */
    private Map<String, Object> handleAddOrStockCommand(String command, Store store) {
        String baseProductName = extractBaseProductName(command);
        if (baseProductName.isEmpty()) {
            baseProductName = "Item";
        }

        String displayName = capitalizeWords(baseProductName);
        boolean explicitCreate = isExplicitCreateCommand(command);

        // CASE A: Check if query is a generic staple term without brand (e.g. "Butter", "Milk", "Ghee")
        // -> DISAMBIGUATION (Requirements 4, 14, 19)
        if (isGenericStaple(baseProductName) && !hasBrandSpecified(baseProductName) && !explicitCreate) {
            List<Map<String, Object>> variants = getGenericStapleVariants(baseProductName);
            String reply = String.format("I understood: %s.\n\nWhich product would you like to add?", displayName);
            return Map.of(
                    "type", "DISAMBIGUATE_PRODUCT",
                    "intent", "DISAMBIGUATE_PRODUCT",
                    "baseProduct", displayName,
                    "reply", reply,
                    "candidates", variants,
                    "candidateProducts", variants
            );
        }

        // Check if existing products in this store match this product
        List<StoreProduct> existingMatches = findMatchingStoreProducts(baseProductName, store.getId());

        int quantity = extractQuantity(command);
        boolean hasExplicitQuantity = command.matches(".*\\b\\d+\\s*(?:packets|packet|pkt|units|unit|pieces|piece|pcs|boxes|box)?\\b.*") &&
                !command.matches(".*\\b(price|rate|₹|rs|rupees)\\s*\\d+.*");

        // CASE 1: Product ALREADY EXISTS in store AND explicit stock quantity specified -> Stock Replenishment
        if (!existingMatches.isEmpty() && hasExplicitQuantity && !explicitCreate) {
            return handleStockAdjustmentForProduct(existingMatches.get(0), quantity, true, command);
        }

        // CASE 2: Product ALREADY EXISTS in store AND NO quantity specified -> ALREADY_EXISTS (Requirement 12)
        if (!existingMatches.isEmpty() && !explicitCreate) {
            StoreProduct sp = existingMatches.get(0);
            String reply = String.format(
                    "\"%s\" is already in your inventory (Current stock: %d, Price: ₹%.2f).\n\nWould you like to increase stock or edit this product?",
                    sp.getProduct().getName(), sp.getStockQuantity(), sp.getPrice()
            );
            return Map.of(
                    "type", "ALREADY_EXISTS",
                    "intent", "ALREADY_EXISTS",
                    "reply", reply,
                    "productName", sp.getProduct().getName(),
                    "existingProduct", Map.of(
                            "storeProductId", sp.getId(),
                            "productName", sp.getProduct().getName(),
                            "currentStock", sp.getStockQuantity(),
                            "price", sp.getPrice(),
                            "imageUrl", sp.getProduct().getImageUrl() != null ? sp.getProduct().getImageUrl() : ""
                    )
            );
        }

        // CASE 3: Product is specific and DOES NOT exist in store -> Directly fetch photos & prepare product details
        return handleCreateProductFlow(displayName, command, store);
    }

    /**
     * Create product workflow: retrieves relevant real internet photos, extracts details, requires confirmation before saving.
     */
    private Map<String, Object> handleCreateProductFlow(String productName, String command, Store store) {
        ProductExtractionResult extracted = extractProductDetails(command, productName);

        // Fetch candidate photos from real internet search service
        List<ProductImageResult> candidateResults = productImageSearchService.searchProductImagesDetailed(
                extracted.fullProductName,
                extracted.brand,
                extracted.packageSize,
                extracted.category
        );

        boolean reliableFound = !candidateResults.isEmpty();
        List<String> candidateImageUrls = candidateResults.stream()
                .map(ProductImageResult::getImageUrl)
                .collect(Collectors.toList());

        String defaultImage = reliableFound ? candidateResults.get(0).getImageUrl() : null;
        String defaultSourceUrl = reliableFound ? candidateResults.get(0).getSourceUrl() : null;
        String defaultSourceName = reliableFound ? candidateResults.get(0).getSourceName() : null;

        String prompt;
        if (reliableFound) {
            prompt = String.format(
                    "I understood: %s\n\nPackage: %s\nCategory: %s\n\nI found %d relevant photos from the internet. Choose your preferred photo below, adjust price/stock if needed, and confirm:",
                    extracted.fullProductName,
                    extracted.packageSize,
                    extracted.category,
                    candidateResults.size()
            );
        } else {
            prompt = String.format(
                    "I understood: %s\n\nPackage: %s\nCategory: %s\n\n⚠️ I couldn't find reliable images on the internet for this exact product.\n\nYou can continue without a photo, upload your own photo, or search again.",
                    extracted.fullProductName,
                    extracted.packageSize,
                    extracted.category
            );
        }

        Map<String, Object> pendingAction = new HashMap<>();
        pendingAction.put("action", "CREATE_PRODUCT");
        pendingAction.put("productName", extracted.fullProductName);
        pendingAction.put("brand", extracted.brand);
        pendingAction.put("packageQuantity", extracted.packageQuantity);
        pendingAction.put("packageSize", extracted.packageSize);
        pendingAction.put("unit", extracted.unit.name());
        pendingAction.put("price", extracted.price);
        pendingAction.put("stockQuantity", extracted.stock);
        pendingAction.put("category", extracted.category);
        pendingAction.put("imageUrl", defaultImage);
        pendingAction.put("imageSourceUrl", defaultSourceUrl);
        pendingAction.put("imageSourceName", defaultSourceName);
        pendingAction.put("candidateImages", candidateImageUrls);
        pendingAction.put("candidateImageResults", candidateResults);
        pendingAction.put("command", command);

        Map<String, Object> response = new HashMap<>();
        response.put("type", "CONFIRMATION_REQUIRED");
        response.put("intent", "CREATE_PRODUCT");
        response.put("reply", prompt);
        response.put("candidateImages", candidateImageUrls);
        response.put("candidateImageResults", candidateResults);
        response.put("reliableImagesFound", reliableFound);
        response.put("selectedImageUrl", defaultImage != null ? defaultImage : "");
        response.put("pendingAction", pendingAction);

        return response;
    }

    private Map<String, Object> handleStockAdjustmentForProduct(StoreProduct sp, int quantity, boolean isAdd, String command) {
        if (!isAdd && sp.getStockQuantity() < quantity) {
            return Map.of(
                    "type", "ERROR",
                    "reply", String.format(
                            "You only have %d %s packet%s.\nYou cannot remove %d.\n\nCurrent stock: %d",
                            sp.getStockQuantity(), sp.getProduct().getName(), sp.getStockQuantity() > 1 ? "s" : "", quantity, sp.getStockQuantity()
                    )
            );
        }

        int projectedStock = isAdd ? (sp.getStockQuantity() + quantity) : (sp.getStockQuantity() - quantity);

        String prompt = String.format(
                "I found:\n%s\nCurrent stock: %d\n\n%s %d unit%s? (New stock will be %d)",
                sp.getProduct().getName(),
                sp.getStockQuantity(),
                isAdd ? "Add" : "Remove",
                quantity,
                quantity > 1 ? "s" : "",
                projectedStock
        );

        Map<String, Object> pendingAction = new HashMap<>();
        pendingAction.put("action", isAdd ? "ADD_STOCK" : "REDUCE_STOCK");
        pendingAction.put("storeProductId", sp.getId());
        pendingAction.put("productName", sp.getProduct().getName());
        pendingAction.put("quantity", quantity);
        pendingAction.put("currentStock", sp.getStockQuantity());
        pendingAction.put("projectedStock", projectedStock);
        pendingAction.put("delta", isAdd ? quantity : -quantity);
        pendingAction.put("command", command);

        return Map.of(
                "type", "CONFIRMATION_REQUIRED",
                "intent", isAdd ? "ADD_STOCK" : "REDUCE_STOCK",
                "reply", prompt,
                "pendingAction", pendingAction
        );
    }

    private Map<String, Object> handleStockAdjustmentCommand(String command, Store store, boolean isAdd) {
        int quantity = extractQuantity(command);
        if (quantity <= 0) quantity = 1;

        String productName = extractProductNameFromStockAdjustment(command);
        List<StoreProduct> matches = findMatchingStoreProducts(productName, store.getId());

        if (matches.isEmpty()) {
            return Map.of(
                    "type", "NOT_FOUND",
                    "reply", "I couldn't find \"" + productName + "\" in your inventory to adjust stock.",
                    "suggestedProduct", productName
            );
        }

        if (matches.size() > 1 && !isExactMatch(matches, productName)) {
            return buildDisambiguationResponse(matches, productName, isAdd ? "ADD_STOCK" : "REDUCE_STOCK", quantity, isAdd ? "ADD" : "REMOVE");
        }

        return handleStockAdjustmentForProduct(matches.get(0), quantity, isAdd, command);
    }

    private Map<String, Object> handleSaleCommand(String command, Store store) {
        int quantity = extractQuantity(command);
        if (quantity <= 0) quantity = 1;

        String productName = extractProductNameFromSale(command);
        List<StoreProduct> matches = findMatchingStoreProducts(productName, store.getId());

        if (matches.isEmpty()) {
            return Map.of(
                    "type", "NOT_FOUND",
                    "reply", "I couldn't find \"" + productName + "\" in your inventory to record this sale.",
                    "suggestedProduct", productName
            );
        }

        if (matches.size() > 1 && !isExactMatch(matches, productName)) {
            return buildDisambiguationResponse(matches, productName, "RECORD_SALE", quantity, "SALE");
        }

        StoreProduct sp = matches.get(0);

        if (sp.getStockQuantity() < quantity) {
            return Map.of(
                    "type", "ERROR",
                    "reply", String.format(
                            "Insufficient stock: You only have %d %s available.\nCannot sell %d.",
                            sp.getStockQuantity(), sp.getProduct().getName(), quantity
                    )
            );
        }

        double totalAmount = sp.getPrice() * quantity;
        int remainingStock = sp.getStockQuantity() - quantity;

        String prompt = String.format(
                "Record sale for:\n%s\nSold: %d unit%s @ ₹%.2f\nTotal: ₹%.2f\nRemaining stock: %d\n\nConfirm recording this sale?",
                sp.getProduct().getName(), quantity, quantity > 1 ? "s" : "", sp.getPrice(), totalAmount, remainingStock
        );

        Map<String, Object> pendingAction = new HashMap<>();
        pendingAction.put("action", "RECORD_SALE");
        pendingAction.put("storeProductId", sp.getId());
        pendingAction.put("productName", sp.getProduct().getName());
        pendingAction.put("quantity", quantity);
        pendingAction.put("unitPrice", sp.getPrice());
        pendingAction.put("totalAmount", totalAmount);
        pendingAction.put("previousStock", sp.getStockQuantity());
        pendingAction.put("remainingStock", remainingStock);
        pendingAction.put("command", command);

        return Map.of(
                "type", "CONFIRMATION_REQUIRED",
                "intent", "RECORD_SALE",
                "reply", prompt,
                "pendingAction", pendingAction
        );
    }

    private Map<String, Object> handleDeleteCommand(String command, Store store) {
        String productName = extractProductNameFromDelete(command);
        List<StoreProduct> matches = findMatchingStoreProducts(productName, store.getId());

        if (matches.isEmpty()) {
            return Map.of(
                    "type", "NOT_FOUND",
                    "reply", "I couldn't find \"" + productName + "\" in your inventory to delete."
            );
        }

        if (matches.size() > 1 && !isExactMatch(matches, productName)) {
            return buildDisambiguationResponse(matches, productName, "DELETE_PRODUCT", 0, "DELETE");
        }

        StoreProduct sp = matches.get(0);

        String prompt = String.format(
                "I found:\n\n%s\nCurrent stock: %d\n\n⚠️ Deleting this product will remove it from your active inventory.\n\nAre you sure?",
                sp.getProduct().getName(), sp.getStockQuantity()
        );

        Map<String, Object> pendingAction = new HashMap<>();
        pendingAction.put("action", "DELETE_PRODUCT");
        pendingAction.put("storeProductId", sp.getId());
        pendingAction.put("productName", sp.getProduct().getName());
        pendingAction.put("currentStock", sp.getStockQuantity());
        pendingAction.put("isDestructive", true);
        pendingAction.put("command", command);

        return Map.of(
                "type", "CONFIRMATION_REQUIRED",
                "intent", "DELETE_PRODUCT",
                "isDestructive", true,
                "reply", prompt,
                "pendingAction", pendingAction
        );
    }

    private Map<String, Object> handleUpdatePriceCommand(String command, Store store) {
        Double newPrice = extractPrice(command);
        if (newPrice == null || newPrice <= 0) {
            return Map.of("type", "ERROR", "reply", "Please specify a valid price (e.g. \"Change Amul Milk price to ₹34\").");
        }

        String productName = extractProductNameFromPriceUpdate(command);
        List<StoreProduct> matches = findMatchingStoreProducts(productName, store.getId());

        if (matches.isEmpty()) {
            return Map.of("type", "NOT_FOUND", "reply", "I couldn't find \"" + productName + "\" to update price.");
        }

        if (matches.size() > 1 && !isExactMatch(matches, productName)) {
            return buildDisambiguationResponse(matches, productName, "UPDATE_PRICE", newPrice.intValue(), "PRICE");
        }

        StoreProduct sp = matches.get(0);

        String prompt = String.format(
                "%s\n\nCurrent price: ₹%.2f\nNew price: ₹%.2f\n\nUpdate price?",
                sp.getProduct().getName(), sp.getPrice(), newPrice
        );

        Map<String, Object> pendingAction = new HashMap<>();
        pendingAction.put("action", "UPDATE_PRICE");
        pendingAction.put("storeProductId", sp.getId());
        pendingAction.put("productName", sp.getProduct().getName());
        pendingAction.put("oldPrice", sp.getPrice());
        pendingAction.put("newPrice", newPrice);
        pendingAction.put("command", command);

        return Map.of(
                "type", "CONFIRMATION_REQUIRED",
                "intent", "UPDATE_PRICE",
                "reply", prompt,
                "pendingAction", pendingAction
        );
    }

    private Map<String, Object> handleUpdateLocationCommand(String command, Store store) {
        String locationStr = extractLocationString(command);
        String productName = extractProductNameFromLocation(command);
        List<StoreProduct> matches = findMatchingStoreProducts(productName, store.getId());

        if (matches.isEmpty()) {
            return Map.of("type", "NOT_FOUND", "reply", "I couldn't find \"" + productName + "\" to update location.");
        }

        if (matches.size() > 1 && !isExactMatch(matches, productName)) {
            return buildDisambiguationResponse(matches, productName, "UPDATE_LOCATION", 0, "LOCATION");
        }

        StoreProduct sp = matches.get(0);
        String oldLoc = String.format("Aisle: %s, Row: %s, Shelf: %s",
                sp.getAisleNumber() != null ? sp.getAisleNumber() : "-",
                sp.getRowNumber() != null ? sp.getRowNumber() : "-",
                sp.getShelfNumber() != null ? sp.getShelfNumber() : "-");

        String prompt = String.format(
                "%s\n\nCurrent location: %s\nNew location: %s\n\nUpdate location?",
                sp.getProduct().getName(), oldLoc, locationStr
        );

        Map<String, Object> pendingAction = new HashMap<>();
        pendingAction.put("action", "UPDATE_LOCATION");
        pendingAction.put("storeProductId", sp.getId());
        pendingAction.put("productName", sp.getProduct().getName());
        pendingAction.put("newLocation", locationStr);
        pendingAction.put("command", command);

        return Map.of(
                "type", "CONFIRMATION_REQUIRED",
                "intent", "UPDATE_LOCATION",
                "reply", prompt,
                "pendingAction", pendingAction
        );
    }

    private Map<String, Object> handleUpdateProductInfoCommand(String command, Store store) {
        String lower = command.toLowerCase();

        if (lower.contains("category to")) {
            String[] parts = command.split("(?i)category to");
            String prodPart = parts[0].replaceAll("(?i)^(change|set|update)", "").trim();
            String catPart = parts[1].trim();

            List<StoreProduct> matches = findMatchingStoreProducts(prodPart, store.getId());
            if (matches.isEmpty()) {
                return Map.of("type", "NOT_FOUND", "reply", "I couldn't find product \"" + prodPart + "\".");
            }
            StoreProduct sp = matches.get(0);
            String oldCat = sp.getProduct().getCategory() != null ? sp.getProduct().getCategory().getName() : "Uncategorized";

            String prompt = String.format(
                    "%s\n\nCurrent Category: %s\nNew Category: %s\n\nUpdate category?",
                    sp.getProduct().getName(), oldCat, catPart
            );

            Map<String, Object> pendingAction = new HashMap<>();
            pendingAction.put("action", "UPDATE_PRODUCT");
            pendingAction.put("storeProductId", sp.getId());
            pendingAction.put("productName", sp.getProduct().getName());
            pendingAction.put("field", "category");
            pendingAction.put("categoryName", catPart);
            pendingAction.put("command", command);

            return Map.of(
                    "type", "CONFIRMATION_REQUIRED",
                    "intent", "UPDATE_PRODUCT",
                    "reply", prompt,
                    "pendingAction", pendingAction
            );
        }

        if (lower.contains("from") && lower.contains("to")) {
            Pattern p = Pattern.compile("(?i)from\\s+(.+?)\\s+to\\s+(.+)");
            Matcher m = p.matcher(command);
            if (m.find()) {
                String oldName = m.group(1).trim();
                String newName = m.group(2).trim();

                List<StoreProduct> matches = findMatchingStoreProducts(oldName, store.getId());
                if (matches.isEmpty()) {
                    return Map.of("type", "NOT_FOUND", "reply", "I couldn't find product \"" + oldName + "\".");
                }
                StoreProduct sp = matches.get(0);

                String prompt = String.format(
                        "Current name: %s\nNew name: %s\n\nUpdate product name?",
                        sp.getProduct().getName(), newName
                );

                Map<String, Object> pendingAction = new HashMap<>();
                pendingAction.put("action", "UPDATE_PRODUCT");
                pendingAction.put("storeProductId", sp.getId());
                pendingAction.put("field", "name");
                pendingAction.put("newName", newName);
                pendingAction.put("command", command);

                return Map.of(
                        "type", "CONFIRMATION_REQUIRED",
                        "intent", "UPDATE_PRODUCT",
                        "reply", prompt,
                        "pendingAction", pendingAction
                );
            }
        }

        return Map.of("type", "MESSAGE", "reply", "I didn't quite catch the product change. You can say:\n• \"Change Amul Milk category to Dairy\"\n• \"Change product name from Maggi to Maggi 2-Minute Noodles\"");
    }

    private Map<String, Object> handlePhotoCommand(String command, Store store) {
        String clean = command.replaceAll("(?i)^(find photos for|find photo for|search photos for|search photo of|photos of|photo of|change photo of|update photo of|add photo to|add image to|set photo of)", "")
                .replaceAll("(?i)(photos|photo|picture|image|tasveer|internet se photo|photo dikhao|photo lagao)", "")
                .trim();

        List<StoreProduct> matches = findMatchingStoreProducts(clean, store.getId());
        if (matches.isEmpty()) {
            List<ProductImageResult> candidateResults = productImageSearchService.searchProductImagesDetailed(clean, "", "", "");
            List<String> candidateImages = candidateResults.stream().map(ProductImageResult::getImageUrl).collect(Collectors.toList());
            return Map.of(
                    "type", "MESSAGE",
                    "intent", "SEARCH_IMAGES",
                    "reply", "Here are photos I found from the web for \"" + clean + "\":",
                    "candidateImages", candidateImages,
                    "candidateImageResults", candidateResults,
                    "reliableImagesFound", !candidateResults.isEmpty()
            );
        }

        StoreProduct sp = matches.get(0);
        String pName = sp.getProduct().getName();
        String brand = sp.getProduct().getBrand() != null ? sp.getProduct().getBrand() : "";
        String pkg = sp.getPackageQuantity() > 0 ? (sp.getPackageQuantity() + " " + (sp.getUnit() != null ? sp.getUnit().name().toLowerCase() : "")) : "";
        String cat = sp.getProduct().getCategory() != null ? sp.getProduct().getCategory().getName() : "";
        List<ProductImageResult> candidateResults = productImageSearchService.searchProductImagesDetailed(pName, brand, pkg, cat);
        List<String> candidateImages = candidateResults.stream().map(ProductImageResult::getImageUrl).collect(Collectors.toList());
        String defaultImage = candidateResults.isEmpty() ? null : candidateResults.get(0).getImageUrl();
        String defaultSourceUrl = candidateResults.isEmpty() ? null : candidateResults.get(0).getSourceUrl();
        String defaultSourceName = candidateResults.isEmpty() ? null : candidateResults.get(0).getSourceName();

        String prompt = String.format(
                "I found %d photos from the web for \"%s\". Choose a photo to update this product:",
                candidateResults.size(), pName
        );

        Map<String, Object> pendingAction = new HashMap<>();
        pendingAction.put("action", "UPDATE_PHOTO");
        pendingAction.put("storeProductId", sp.getId());
        pendingAction.put("productName", pName);
        pendingAction.put("imageUrl", defaultImage);
        pendingAction.put("imageSourceUrl", defaultSourceUrl);
        pendingAction.put("imageSourceName", defaultSourceName);
        pendingAction.put("candidateImages", candidateImages);
        pendingAction.put("candidateImageResults", candidateResults);
        pendingAction.put("command", command);

        Map<String, Object> response = new HashMap<>();
        response.put("type", "CONFIRMATION_REQUIRED");
        response.put("intent", "UPDATE_PHOTO");
        response.put("reply", prompt);
        response.put("candidateImages", candidateImages);
        response.put("candidateImageResults", candidateResults);
        response.put("reliableImagesFound", !candidateResults.isEmpty());
        response.put("selectedImageUrl", defaultImage != null ? defaultImage : "");
        response.put("pendingAction", pendingAction);

        return response;
    }

    private Map<String, Object> handleGeneralSearch(String command, Store store) {
        List<StoreProduct> matches = findMatchingStoreProducts(command, store.getId());
        if (!matches.isEmpty()) {
            StringBuilder sb = new StringBuilder("I found the following items in your inventory:\n\n");
            for (StoreProduct sp : matches) {
                sb.append(String.format("• %s — Stock: %d (₹%.2f)\n", sp.getProduct().getName(), sp.getStockQuantity(), sp.getPrice()));
            }
            return Map.of("type", "MESSAGE", "intent", "SEARCH_PRODUCT", "reply", sb.toString().trim());
        }

        return Map.of(
                "type", "MESSAGE",
                "reply", "I am your AI Store Assistant for \"" + store.getName() + "\".\n\nYou can ask me:\n• \"Butter ko add kar do mere inventory mein\"\n• \"Add 20 Amul milk\"\n• \"Remove 5 Maggi\"\n• \"I sold 8 Tata Salt\"\n• \"Change Amul Milk price to ₹34\"\n• \"What products are low in stock?\"\n• \"Delete Maggi from my inventory\""
        );
    }

    // =========================================================================
    // EXECUTION OF CONFIRMED ACTION
    // =========================================================================

    @Transactional
    public Map<String, Object> executeConfirmedAction(Map<String, Object> pendingAction, Long userId, Role role, Long tokenStoreId) {
        if (pendingAction == null || !pendingAction.containsKey("action")) {
            throw new IllegalArgumentException("Invalid pending action payload");
        }

        Store store = resolveAuthenticatedStore(userId, role, tokenStoreId);
        String action = (String) pendingAction.get("action");
        String command = (String) pendingAction.getOrDefault("command", "");

        User user = userRepository.findById(userId).orElse(null);
        String userName = user != null ? user.getFullName() : "Shopkeeper";

        try {
            switch (action) {
                case "ADD_STOCK":
                case "REDUCE_STOCK": {
                    Long spId = ((Number) pendingAction.get("storeProductId")).longValue();
                    int delta = ((Number) pendingAction.get("delta")).intValue();

                    StoreProduct sp = storeProductRepository.findById(spId)
                            .orElseThrow(() -> new RuntimeException("Product not found"));

                    if (!sp.getStore().getId().equals(store.getId())) {
                        throw new SecurityException("Cross-store mutation forbidden");
                    }

                    StoreProduct updated = storeProductService.adjustStock(spId, delta);

                    String details = String.format("Stock adjusted by %d for %s. New stock: %d", delta, sp.getProduct().getName(), updated.getStockQuantity());
                    recordAuditLog(store.getId(), userId, userName, action, command, details, "SUCCESS");

                    String message = String.format("✓ Successfully updated %s stock to %d units.", sp.getProduct().getName(), updated.getStockQuantity());
                    return Map.of("status", "SUCCESS", "message", message, "updatedProduct", updated);
                }

                case "RECORD_SALE": {
                    Long spId = ((Number) pendingAction.get("storeProductId")).longValue();
                    int quantity = ((Number) pendingAction.get("quantity")).intValue();

                    StoreProduct sp = storeProductRepository.findById(spId)
                            .orElseThrow(() -> new RuntimeException("Product not found"));

                    if (!sp.getStore().getId().equals(store.getId())) {
                        throw new SecurityException("Cross-store mutation forbidden");
                    }

                    Sale saleReq = new Sale();
                    saleReq.setCustomerName("Cash Counter Sale");
                    SaleItem item = new SaleItem(sp, quantity);
                    saleReq.setItems(List.of(item));

                    Sale recordedSale = saleService.recordSale(store.getId(), saleReq);

                    StoreProduct refreshed = storeProductRepository.findById(spId).orElse(sp);

                    String details = String.format("Sale recorded: %d x %s @ ₹%.2f (Total: ₹%.2f)", quantity, sp.getProduct().getName(), sp.getPrice(), sp.getPrice() * quantity);
                    recordAuditLog(store.getId(), userId, userName, action, command, details, "SUCCESS");

                    String message = String.format("✓ Recorded sale for %d x %s. Stock reduced to %d.", quantity, sp.getProduct().getName(), refreshed.getStockQuantity());
                    return Map.of("status", "SUCCESS", "message", message, "sale", recordedSale, "updatedProduct", refreshed);
                }

                case "UPDATE_PRICE": {
                    Long spId = ((Number) pendingAction.get("storeProductId")).longValue();
                    double newPrice = ((Number) pendingAction.get("newPrice")).doubleValue();
                    StoreProduct sp = storeProductRepository.findById(spId)
                            .orElseThrow(() -> new RuntimeException("Product not found"));

                    if (!sp.getStore().getId().equals(store.getId())) {
                        throw new SecurityException("Cross-store mutation forbidden");
                    }

                    double oldPrice = sp.getPrice();
                    sp.setPrice(newPrice);
                    StoreProduct updated = storeProductRepository.save(sp);

                    String details = String.format("Price changed for %s: ₹%.2f → ₹%.2f", sp.getProduct().getName(), oldPrice, newPrice);
                    recordAuditLog(store.getId(), userId, userName, action, command, details, "SUCCESS");

                    String message = String.format("✓ Updated price for %s to ₹%.2f.", sp.getProduct().getName(), newPrice);
                    return Map.of("status", "SUCCESS", "message", message, "updatedProduct", updated);
                }

                case "UPDATE_LOCATION": {
                    Long spId = ((Number) pendingAction.get("storeProductId")).longValue();
                    String locStr = (String) pendingAction.get("newLocation");
                    StoreProduct sp = storeProductRepository.findById(spId)
                            .orElseThrow(() -> new RuntimeException("Product not found"));

                    if (!sp.getStore().getId().equals(store.getId())) {
                        throw new SecurityException("Cross-store mutation forbidden");
                    }

                    Pattern ap = Pattern.compile("(?i)aisle\\s*([a-z0-9]+)");
                    Pattern rp = Pattern.compile("(?i)row\\s*([a-z0-9]+)");
                    Pattern shp = Pattern.compile("(?i)shelf\\s*([a-z0-9]+)");

                    Matcher am = ap.matcher(locStr);
                    if (am.find()) sp.setAisleNumber(am.group(1).toUpperCase());

                    Matcher rm = rp.matcher(locStr);
                    if (rm.find()) sp.setRowNumber(rm.group(1).toUpperCase());

                    Matcher shm = shp.matcher(locStr);
                    if (shm.find()) sp.setShelfNumber(shm.group(1).toUpperCase());

                    StoreProduct updated = storeProductRepository.save(sp);

                    String details = String.format("Location updated for %s: %s", sp.getProduct().getName(), locStr);
                    recordAuditLog(store.getId(), userId, userName, action, command, details, "SUCCESS");

                    String message = String.format("✓ Updated location for %s to %s.", sp.getProduct().getName(), locStr);
                    return Map.of("status", "SUCCESS", "message", message, "updatedProduct", updated);
                }

                case "UPDATE_PRODUCT": {
                    Long spId = ((Number) pendingAction.get("storeProductId")).longValue();
                    String field = (String) pendingAction.get("field");
                    StoreProduct sp = storeProductRepository.findById(spId)
                            .orElseThrow(() -> new RuntimeException("Product not found"));

                    if (!sp.getStore().getId().equals(store.getId())) {
                        throw new SecurityException("Cross-store mutation forbidden");
                    }

                    Product product = sp.getProduct();
                    String details = "";

                    if ("name".equals(field)) {
                        String newName = (String) pendingAction.get("newName");
                        String oldName = product.getName();
                        product.setName(newName);
                        productRepository.save(product);
                        details = String.format("Product name updated from \"%s\" to \"%s\"", oldName, newName);
                    } else if ("category".equals(field)) {
                        String catName = (String) pendingAction.get("categoryName");
                        Category cat = categoryRepository.findAll().stream()
                                .filter(c -> c.getName().equalsIgnoreCase(catName))
                                .findFirst()
                                .orElseGet(() -> categoryRepository.save(new Category(catName, catName + " category")));
                        product.setCategory(cat);
                        productRepository.save(product);
                        details = String.format("Product \"%s\" category updated to \"%s\"", product.getName(), catName);
                    }

                    recordAuditLog(store.getId(), userId, userName, action, command, details, "SUCCESS");
                    return Map.of("status", "SUCCESS", "message", "✓ " + details + ".", "updatedProduct", sp);
                }

                case "CREATE_PRODUCT": {
                    String pName = (String) pendingAction.get("productName");
                    double pkgQty = ((Number) pendingAction.get("packageQuantity")).doubleValue();
                    ProductUnit unit = ProductUnit.valueOf(((String) pendingAction.get("unit")).toUpperCase());
                    double price = ((Number) pendingAction.get("price")).doubleValue();
                    int stock = ((Number) pendingAction.get("stockQuantity")).intValue();
                    String catName = (String) pendingAction.get("category");

                    Product newP = new Product();
                    newP.setName(pName);
                    newP.setDescription(pName + " (" + pkgQty + " " + unit.name().toLowerCase() + ")");
                    Category cat = categoryRepository.findAll().stream()
                            .filter(c -> c.getName().equalsIgnoreCase(catName))
                            .findFirst()
                            .orElseGet(() -> categoryRepository.save(new Category(catName, catName + " category")));
                    newP.setCategory(cat);

                    if (pendingAction.containsKey("imageUrl") && pendingAction.get("imageUrl") != null) {
                        String img = (String) pendingAction.get("imageUrl");
                        if (!img.trim().isEmpty()) {
                            String storedUrl = fileStorageService.downloadAndStoreImage(img.trim());
                            newP.setImageUrl(storedUrl);
                        }
                    }
                    if (pendingAction.containsKey("imageSourceUrl") && pendingAction.get("imageSourceUrl") != null) {
                        newP.setImageSourceUrl((String) pendingAction.get("imageSourceUrl"));
                    }
                    if (pendingAction.containsKey("imageSourceName") && pendingAction.get("imageSourceName") != null) {
                        newP.setImageSourceName((String) pendingAction.get("imageSourceName"));
                    }
                    if (pendingAction.containsKey("brand") && pendingAction.get("brand") != null) {
                        newP.setBrand((String) pendingAction.get("brand"));
                    }

                    StoreProduct newSp = new StoreProduct();
                    newSp.setPrice(price);
                    newSp.setMrp(price);
                    newSp.setPackageQuantity(pkgQty);
                    newSp.setUnit(unit);
                    newSp.setStockQuantity(stock);
                    newSp.setLowStockThreshold(5);

                    StoreProduct created = storeProductService.addProductToStore(store.getId(), newSp, newP);

                    String details = String.format("Created product \"%s\" (%d units @ ₹%.2f, Cat: %s)", pName, stock, price, catName);
                    recordAuditLog(store.getId(), userId, userName, action, command, details, "SUCCESS");

                    String message = String.format("✓ Added new product \"%s\" with %d units at ₹%.2f.", pName, stock, price);
                    return Map.of("status", "SUCCESS", "message", message, "updatedProduct", created);
                }

                case "UPDATE_PHOTO": {
                    Long spId = ((Number) pendingAction.get("storeProductId")).longValue();
                    String imgUrl = (String) pendingAction.get("imageUrl");
                    StoreProduct sp = storeProductRepository.findById(spId)
                            .orElseThrow(() -> new RuntimeException("Product not found"));

                    if (!sp.getStore().getId().equals(store.getId())) {
                        throw new SecurityException("Cross-store mutation forbidden");
                    }

                    Product product = sp.getProduct();
                    if (imgUrl != null && !imgUrl.trim().isEmpty()) {
                        String storedUrl = fileStorageService.downloadAndStoreImage(imgUrl.trim());
                        product.setImageUrl(storedUrl);
                        if (pendingAction.containsKey("imageSourceUrl") && pendingAction.get("imageSourceUrl") != null) {
                            product.setImageSourceUrl((String) pendingAction.get("imageSourceUrl"));
                        }
                        if (pendingAction.containsKey("imageSourceName") && pendingAction.get("imageSourceName") != null) {
                            product.setImageSourceName((String) pendingAction.get("imageSourceName"));
                        }
                    }
                    productRepository.save(product);

                    String details = String.format("Updated photo for \"%s\"", product.getName());
                    recordAuditLog(store.getId(), userId, userName, action, command, details, "SUCCESS");
                    return Map.of("status", "SUCCESS", "message", "✓ Updated photo for " + product.getName() + ".", "updatedProduct", sp);
                }

                case "DELETE_PRODUCT": {
                    Long spId = ((Number) pendingAction.get("storeProductId")).longValue();
                    StoreProduct sp = storeProductRepository.findById(spId)
                            .orElseThrow(() -> new RuntimeException("Product not found"));

                    if (!sp.getStore().getId().equals(store.getId())) {
                        throw new SecurityException("Cross-store mutation forbidden");
                    }

                    String deletedName = sp.getProduct().getName();
                    int lastStock = sp.getStockQuantity();
                    storeProductService.removeProductFromStore(spId);

                    String details = String.format("Deleted product \"%s\" (last stock: %d) from store", deletedName, lastStock);
                    recordAuditLog(store.getId(), userId, userName, action, command, details, "SUCCESS");

                    String message = String.format("✓ Removed %s from your active inventory.", deletedName);
                    return Map.of("status", "SUCCESS", "message", message, "deletedProductId", spId);
                }

                default:
                    throw new UnsupportedOperationException("Unknown action: " + action);
            }
        } catch (Exception e) {
            recordAuditLog(store.getId(), userId, userName, action, command, "Failed: " + e.getMessage(), "FAILED");
            throw new RuntimeException("I couldn't update the inventory right now: " + e.getMessage(), e);
        }
    }

    /**
     * Retrieve recent AI audit logs for the store.
     */
    public List<AiAuditLog> getStoreAuditLogs(Long storeId) {
        return aiAuditLogRepository.findByStoreIdOrderByTimestampDesc(storeId);
    }

    private void recordAuditLog(Long storeId, Long userId, String userName, String action, String command, String details, String result) {
        try {
            AiAuditLog log = new AiAuditLog(storeId, userId, userName, action, command, details, result);
            aiAuditLogRepository.save(log);
        } catch (Exception e) {
            // Non-blocking log persistence
        }
    }

    // =========================================================================
    // DISAMBIGUATION & HELPER METHODS
    // =========================================================================

    private Map<String, Object> buildDisambiguationResponse(List<StoreProduct> matches, String query, String pendingIntent, int quantity, String opType) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("I found %d products matching \"%s\":\n\n", matches.size(), query));
        for (int i = 0; i < matches.size(); i++) {
            StoreProduct sp = matches.get(i);
            sb.append(String.format("%d. %s (Current stock: %d)\n", i + 1, sp.getProduct().getName(), sp.getStockQuantity()));
        }
        sb.append("\nWhich product do you mean?");

        List<Map<String, Object>> candidates = matches.stream().map(sp -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", sp.getId());
            m.put("name", sp.getProduct().getName());
            m.put("currentStock", sp.getStockQuantity());
            m.put("price", sp.getPrice());
            return m;
        }).collect(Collectors.toList());

        return Map.of(
                "type", "AMBIGUOUS",
                "intent", pendingIntent,
                "quantity", quantity,
                "opType", opType,
                "reply", sb.toString().trim(),
                "candidates", candidates
        );
    }

    private boolean isExactMatch(List<StoreProduct> matches, String query) {
        String clean = query.trim().toLowerCase();
        for (StoreProduct sp : matches) {
            if (sp.getProduct().getName().trim().equalsIgnoreCase(clean)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Strict matching of products in the shopkeeper's store.
     * Guaranteed: Never matches unrelated products (e.g., filler word 'do' matching 'Dove').
     */
    public List<StoreProduct> findMatchingStoreProducts(String query, Long storeId) {
        if (query == null || query.trim().isEmpty()) return Collections.emptyList();
        String clean = cleanSearchQuery(query);
        if (clean.isEmpty()) return Collections.emptyList();

        List<StoreProduct> all = storeProductRepository.findByStoreId(storeId);

        // 1. Exact full name match (case-insensitive)
        List<StoreProduct> exact = all.stream()
                .filter(sp -> sp.getProduct().getName().equalsIgnoreCase(clean))
                .collect(Collectors.toList());
        if (!exact.isEmpty()) return exact;

        // 2. Starts with query or name contains full query phrase (min length 4)
        if (clean.length() >= 4) {
            List<StoreProduct> contains = all.stream()
                    .filter(sp -> sp.getProduct().getName().toLowerCase().contains(clean) ||
                            (sp.getProduct().getBrand() != null && sp.getProduct().getBrand().toLowerCase().contains(clean)))
                    .collect(Collectors.toList());
            if (!contains.isEmpty()) return contains;
        }

        // 3. Strict token match with scoring — only full tokens, never substrings
        String[] words = clean.split("\\s+");
        List<String> validWords = Arrays.stream(words)
                .map(String::trim)
                .filter(w -> w.length() >= 3 && !STOP_WORDS.contains(w))
                .collect(Collectors.toList());

        if (validWords.isEmpty()) return Collections.emptyList();

        List<String> nonBrandWords = validWords.stream()
                .filter(w -> !KNOWN_BRANDS.contains(w))
                .collect(Collectors.toList());

        Map<StoreProduct, Integer> scoreMap = new HashMap<>();
        for (StoreProduct sp : all) {
            String pName = sp.getProduct().getName().toLowerCase();
            String brand = sp.getProduct().getBrand() != null ? sp.getProduct().getBrand().toLowerCase() : "";
            Set<String> productTokens = new HashSet<>(Arrays.asList((pName + " " + brand).split("\\s+")));

            // If the query explicitly specifies a brand (e.g. "Cadbury", "Amul", "Britannia"),
            // the existing product MUST NOT be from a conflicting brand!
            String queryBrand = extractBrand(clean, clean);
            if (!queryBrand.isEmpty()) {
                String existingBrand = sp.getProduct().getBrand() != null ? sp.getProduct().getBrand().toLowerCase() : "";
                if (!existingBrand.isEmpty() && !existingBrand.contains(queryBrand.toLowerCase()) && !pName.contains(queryBrand.toLowerCase())) {
                    continue; // Skip products with conflicting brand
                }
            }

            // If the query contains non-brand product nouns (e.g. "ghee", "butter"), the product MUST match them!
            // Prevents "Amul Ghee" from ever matching "Amul Butter" or "Amul Taaza Milk"!
            if (!nonBrandWords.isEmpty()) {
                boolean matchesNonBrand = nonBrandWords.stream().anyMatch(nw ->
                        productTokens.contains(nw) || productTokens.stream().anyMatch(pt -> pt.startsWith(nw) && nw.length() >= 4));
                if (!matchesNonBrand) {
                    continue; // Skip products that don't match the actual item noun
                }
            }

            int score = 0;
            for (String w : validWords) {
                // Word boundary / token equality match — NEVER partial substring match of unrelated words!
                boolean matched = productTokens.contains(w) ||
                        productTokens.stream().anyMatch(pt -> pt.startsWith(w) && w.length() >= 4);
                if (matched) {
                    score++;
                }
            }
            // Require at least 1 strong word match, and for multi-word queries require >= 50% match
            if (score > 0 && (score >= (validWords.size() + 1) / 2)) {
                scoreMap.put(sp, score);
            }
        }

        if (scoreMap.isEmpty()) return Collections.emptyList();

        int maxScore = Collections.max(scoreMap.values());
        return scoreMap.entrySet().stream()
                .filter(e -> e.getValue() == maxScore)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private String cleanSearchQuery(String text) {
        return text.toLowerCase()
                .replaceAll("(?i)\\b(mere\\s+inventory\\s+mein|inventory\\s+mein|inventory\\s+me|dukan\\s+mein|store\\s+mein)\\b", "")
                .replaceAll("(?i)\\b(ko\\s+add\\s+kar\\s+do|add\\s+kar\\s+do|add\\s+karo|add\\s+kardo|daal\\s+do|daalo|jodo)\\b", "")
                .replaceAll("(?i)\\b(delete\\s+kar\\s+do|delete\\s+karo|hata\\s+do|hatao)\\b", "")
                .replaceAll("[^a-zA-Z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    // =========================================================================
    // INTENT & PARAMETER EXTRACTION
    // =========================================================================

    private String normalizeText(String text) {
        return text.trim()
                .replaceAll("(?i)\\b(twenty[ -]?five)\\b", "25")
                .replaceAll("(?i)\\b(twenty)\\b", "20")
                .replaceAll("(?i)\\b(fifty)\\b", "50")
                .replaceAll("(?i)\\b(thirty)\\b", "30")
                .replaceAll("(?i)\\b(forty)\\b", "40")
                .replaceAll("(?i)\\b(ten)\\b", "10")
                .replaceAll("(?i)\\b(fifteen)\\b", "15")
                .replaceAll("(?i)\\b(five)\\b", "5")
                .replaceAll("(?i)\\b(eight)\\b", "8")
                .replaceAll("(?i)\\b(four)\\b", "4")
                .replaceAll("(?i)\\b(three)\\b", "3")
                .replaceAll("(?i)\\b(two)\\b", "2")
                .replaceAll("(?i)\\b(one)\\b", "1")
                // Hindi/Hinglish numbers
                .replaceAll("(?i)\\b(bees)\\b", "20")
                .replaceAll("(?i)\\b(pachaas|pachas)\\b", "50")
                .replaceAll("(?i)\\b(das)\\b", "10")
                .replaceAll("(?i)\\b(paanch|panch)\\b", "5")
                .replaceAll("(?i)\\b(aath)\\b", "8");
    }

    private boolean isSummaryQuery(String text) {
        String lower = text.toLowerCase();
        return lower.contains("how many products") || lower.contains("total products") ||
                lower.contains("inventory summary") || lower.contains("inventory count") ||
                lower.contains("kitne product");
    }

    private boolean isLowStockQuery(String text) {
        String lower = text.toLowerCase();
        return lower.contains("low in stock") || lower.contains("low stock") ||
                lower.contains("kam stock") || lower.contains("running low") ||
                lower.contains("kam bacha");
    }

    private boolean isOutOfStockQuery(String text) {
        String lower = text.toLowerCase();
        return lower.contains("out of stock") || lower.contains("zero stock") ||
                lower.contains("khatam") || lower.contains("which products are out of stock");
    }

    private boolean isStockQuestion(String text) {
        String lower = text.toLowerCase();
        return lower.startsWith("how much") || lower.startsWith("what is the stock") ||
                lower.startsWith("what is stock") || lower.contains("do i have") ||
                lower.contains("kitna hai") || lower.contains("ka stock kya hai") ||
                lower.startsWith("stock of");
    }

    private boolean isDeleteCommand(String text) {
        String lower = text.toLowerCase();
        return lower.contains("delete") || (lower.contains("remove") && (lower.contains("from my") || lower.contains("from store") || lower.contains("from inventory"))) ||
                lower.contains("hata do") || lower.contains("hatao") || lower.contains("delete kar do");
    }

    private boolean isUpdatePriceCommand(String text) {
        String lower = text.toLowerCase();
        return lower.contains("price to") || lower.contains("rate to") ||
                (lower.contains("price") && (lower.contains("set") || lower.contains("change") || lower.contains("update") || lower.contains("karo"))) ||
                (lower.contains("rate") && (lower.contains("set") || lower.contains("change") || lower.contains("update"))) ||
                lower.matches(".*\\b(price|rate)\\b.*\\d+.*");
    }

    private boolean isUpdateLocationCommand(String text) {
        String lower = text.toLowerCase();
        return lower.contains("location of") || (lower.contains("aisle") && lower.contains("set"));
    }

    private boolean isUpdateProductInfoCommand(String text) {
        String lower = text.toLowerCase();
        return lower.contains("category to") || (lower.contains("change product name") && lower.contains("to"));
    }

    private boolean isPhotoCommand(String text) {
        String lower = text.toLowerCase();
        return lower.contains("photo") || lower.contains("picture") || lower.contains("image") || lower.contains("tasveer");
    }

    private boolean isSaleCommand(String text) {
        String lower = text.toLowerCase();
        return lower.startsWith("i sold") || lower.startsWith("sold") ||
                lower.contains("bik gaya") || lower.contains("becha");
    }

    private boolean isAddOrStockCommand(String text) {
        String lower = text.toLowerCase();
        return lower.contains("add") || lower.contains("create") || lower.contains("naya product") ||
                lower.contains("new product") || lower.contains("daal") || lower.contains("jodo") ||
                lower.contains("badhao");
    }

    private boolean isExplicitCreateCommand(String text) {
        String lower = text.toLowerCase();
        return lower.startsWith("create") || lower.startsWith("new product") || lower.startsWith("naya product") ||
                lower.contains("add new product") || lower.contains("add new item") ||
                lower.contains("for ₹") || lower.contains("for rs") || lower.contains("for rupees") ||
                (lower.contains("price") && lower.contains("stock"));
    }

    private boolean isStockReductionCommand(String text) {
        String lower = text.toLowerCase();
        return lower.contains("remove") || lower.contains("decrease") || lower.contains("reduce") ||
                lower.contains("ghatao") || lower.contains("kam karo");
    }

    /**
     * Extracts clean product name from natural language (English, Hindi, Hinglish).
     * e.g. "Butter ko add kar do mere inventory mein" -> "Butter"
     * e.g. "Amul butter add kar do" -> "Amul Butter"
     * e.g. "20 packet Maggi add karo" -> "Maggi"
     */
    public static String extractBaseProductName(String raw) {
        if (raw == null) return "";
        String text = raw.trim();

        // 1. Remove polite conversational prefix
        text = text.replaceAll("(?i)^(please|kripya|bhai|arre|zara|hello|hi)\\s+", "");

        // 2. Remove common command start phrases
        text = text.replaceAll("(?i)^(create new product|create product|new product|add new product|add new item|add item|add product|add|naya product)\\s+", "");

        // 3. Remove common Hinglish inventory suffixes
        text = text.replaceAll("(?i)\\s+(mere\\s+inventory\\s+mein|meri\\s+inventory\\s+me|inventory\\s+mein|inventory\\s+me|mere\\s+store\\s+mein|store\\s+mein|dukan\\s+mein|shop\\s+mein|ko\\s+inventory\\s+mein)\\b.*$", "");

        // 4. Remove action phrases like "ko add kar do", "add kar do", "add karo", "daal do", "daal dena", "jodo", "badhao", "hata do", "delete kar do"
        text = text.replaceAll("(?i)\\s+(ko\\s+)?(add\\s+kar\\s+do|add\\s+karo|add\\s+kardo|add|daal\\s+do|daal\\s+dena|daalo|jodo|badhao|hata\\s+do|hatao|delete\\s+kar\\s+do|delete\\s+karo)\\b.*$", "");

        // 5. Remove trailing "ko"
        text = text.replaceAll("(?i)\\s+ko$", "");

        // 6. If numbers / price / stock / package sizes were embedded, strip them for base name
        text = text.replaceAll("(?i)\\s+(?:price|rate|stock|quantity|for|with)\\s+.*$", "");
        text = text.replaceAll("(?i)\\s+\\d+\\s*(?:grams|gram|g|kg|ml|litre|l|packet|packets|pkt|units|unit|piece|pieces|pcs|box|boxes)\\b.*$", "");

        // 7. Remove numeric prefix if it was like "20 packet Maggi"
        text = text.replaceAll("(?i)^\\d+\\s*(?:grams|gram|g|kg|ml|litre|l|packet|packets|pkt|units|unit|piece|pieces|pcs|box|boxes)?\\s*(?:of\\s+)?", "");

        return text.trim();
    }

    private boolean isGenericStaple(String query) {
        String clean = query.trim().toLowerCase();
        if (clean.split("\\s+").length >= 3) {
            return false;
        }
        for (String staple : GENERIC_STAPLE_MAP.keySet()) {
            if (clean.equals(staple) || clean.contains(staple)) {
                if (!hasBrandSpecified(clean)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean hasBrandSpecified(String text) {
        String lower = text.toLowerCase();
        for (String brand : KNOWN_BRANDS) {
            if (lower.contains(brand)) {
                return true;
            }
        }
        return false;
    }

    private List<Map<String, Object>> getGenericStapleVariants(String baseName) {
        String lower = baseName.trim().toLowerCase();
        for (Map.Entry<String, List<Map<String, Object>>> entry : GENERIC_STAPLE_MAP.entrySet()) {
            if (lower.equals(entry.getKey()) || lower.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        // Fallback default brand suggestions for unmapped generic queries
        String cap = capitalizeWords(baseName);
        return List.of(
                Map.of("name", "Amul " + cap, "brand", "Amul", "package", "Standard", "packageQuantity", 1.0, "unit", "PACKET", "category", "Grocery & Staples", "defaultPrice", 50.0, "defaultStock", 20),
                Map.of("name", "Tata " + cap, "brand", "Tata", "package", "Standard", "packageQuantity", 1.0, "unit", "PACKET", "category", "Grocery & Staples", "defaultPrice", 45.0, "defaultStock", 20),
                Map.of("name", "Fortune " + cap, "brand", "Fortune", "package", "Standard", "packageQuantity", 1.0, "unit", "PACKET", "category", "Grocery & Staples", "defaultPrice", 55.0, "defaultStock", 20),
                Map.of("name", "Britannia " + cap, "brand", "Britannia", "package", "Standard", "packageQuantity", 1.0, "unit", "PACKET", "category", "Grocery & Staples", "defaultPrice", 40.0, "defaultStock", 20)
        );
    }

    private String capitalizeWords(String str) {
        if (str == null || str.isEmpty()) return "";
        return Arrays.stream(str.split("\\s+"))
                .map(w -> w.isEmpty() ? w : Character.toUpperCase(w.charAt(0)) + w.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }

    private double getDefaultPriceForProduct(String name) {
        String lower = name.toLowerCase();
        if (lower.contains("butter")) return 60.0;
        if (lower.contains("milk")) return 30.0;
        if (lower.contains("ghee")) return 580.0;
        if (lower.contains("atta")) return 220.0;
        if (lower.contains("oil")) return 150.0;
        if (lower.contains("rice")) return 90.0;
        if (lower.contains("salt")) return 28.0;
        if (lower.contains("maggi") || lower.contains("noodle")) return 14.0;
        if (lower.contains("soap")) return 45.0;
        if (lower.contains("shampoo")) return 160.0;
        return 50.0;
    }

    private int extractQuantity(String text) {
        Pattern p = Pattern.compile("(\\d+)");
        Matcher m = p.matcher(text);
        if (m.find()) {
            return Integer.parseInt(m.group(1));
        }
        return 1;
    }

    private Double extractPrice(String text) {
        Pattern p1 = Pattern.compile("(?:price\\s+to|rate\\s+to|price\\s+is|rate\\s+is|to|for|price|rate)\\s*₹?\\s*(\\d+(?:\\.\\d+)?)", Pattern.CASE_INSENSITIVE);
        Matcher m1 = p1.matcher(text);
        if (m1.find()) {
            return Double.parseDouble(m1.group(1));
        }

        Pattern p2 = Pattern.compile("(?:₹|rs\\.?|inr)\\s*(\\d+(?:\\.\\d+)?)", Pattern.CASE_INSENSITIVE);
        Matcher m2 = p2.matcher(text);
        if (m2.find()) {
            return Double.parseDouble(m2.group(1));
        }

        return null;
    }

    private String extractProductNameFromStockQuery(String text) {
        return text.replaceAll("(?i)^(how much|how many|what is the stock of|what is stock of|stock of|stock|do i have)", "")
                .replaceAll("(?i)(do i have|in stock|available|kitna hai|ka stock kya hai|hai|\\?|\\.)", "")
                .trim();
    }

    private String extractProductNameFromStockAdjustment(String text) {
        return extractBaseProductName(text);
    }

    private String extractProductNameFromSale(String text) {
        return text.replaceAll("(?i)^(i sold|sold)", "")
                .replaceAll("(?i)\\b(\\d+)\\b", "")
                .replaceAll("(?i)\\b(packets|packet|units|unit|pieces|piece|pcs|of)\\b", "")
                .replaceAll("(?i)(bik gaya|becha)", "")
                .trim();
    }

    private String extractProductNameFromDelete(String text) {
        return text.replaceAll("(?i)^(delete|remove)\\s+", "")
                .replaceAll("(?i)\\s+(from my inventory|from my products|from store|from products|inventory|delete karo|delete kar do|hatao|hata do|ko hata do)\\b.*$", "")
                .replaceAll("(?i)\\s+ko$", "")
                .trim();
    }

    private String extractProductNameFromPriceUpdate(String text) {
        String[] parts = text.split("(?i)(price to|rate to|price|rate|to)");
        if (parts.length > 0) {
            return parts[0].replaceAll("(?i)^(change|set|update)", "")
                    .replaceAll("(?i)\\b(price|rate|of)\\b", "")
                    .trim();
        }
        return text.trim();
    }

    private String extractProductNameFromLocation(String text) {
        Pattern p = Pattern.compile("(?i)location of\\s+(.+?)\\s+to\\s+");
        Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group(1).trim();
        }
        return "Amul Milk";
    }

    private String extractLocationString(String text) {
        Pattern p = Pattern.compile("(?i)to\\s+(aisle.+)");
        Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group(1).trim();
        }
        return "Aisle 1, Row 1, Shelf A";
    }

    private double extractPackageQuantity(String text) {
        Pattern p = Pattern.compile("(\\d+)\\s*(?:grams|gram|g|kg|ml|litre|l|packet|units|unit)", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        if (m.find()) {
            return Double.parseDouble(m.group(1));
        }
        return 1.0;
    }

    private ProductUnit extractUnit(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("gram") || lower.contains(" g ")) return ProductUnit.GRAM;
        if (lower.contains("kg") || lower.contains("kilo")) return ProductUnit.KG;
        if (lower.contains("ml")) return ProductUnit.ML;
        if (lower.contains("litre") || lower.contains("liter")) return ProductUnit.LITRE;
        if (lower.contains("packet") || lower.contains("pkt")) return ProductUnit.PACKET;
        if (lower.contains("box")) return ProductUnit.BOX;
        return ProductUnit.PIECE;
    }

    private int extractStockForCreation(String text) {
        Pattern p = Pattern.compile("(?:with|stock|quantity)\\s*(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        if (m.find()) {
            return Integer.parseInt(m.group(1));
        }
        return 20;
    }

    private String extractCategory(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("surf") || lower.contains("excel") || lower.contains("detergent") || lower.contains("rin") || lower.contains("ariel") || lower.contains("tide") || lower.contains("cleaner") || lower.contains("harpic") || lower.contains("lizol") || lower.contains("vim") || lower.contains("dishwash")) return "Household & Cleaning";
        if (lower.contains("soap") || lower.contains("shampoo") || lower.contains("toothpaste") || lower.contains("dettol") || lower.contains("dove") || lower.contains("lux") || lower.contains("colgate") || lower.contains("pepsodent")) return "Personal Care";
        if (lower.contains("cola") || lower.contains("pepsi") || lower.contains("coke") || lower.contains("drink") || lower.contains("soda") || lower.contains("sprite") || lower.contains("limca") || lower.contains("fanta") || lower.contains("frooti") || lower.contains("maaza") || lower.contains("tea") || lower.contains("coffee") || lower.contains("chai")) return "Beverages";
        if (lower.contains("butter") || lower.contains("milk") || lower.contains("cheese") || lower.contains("curd") || lower.contains("paneer") || lower.contains("ghee") || lower.contains("dahi")) return "Dairy";
        if (lower.contains("maggi") || lower.contains("noodle") || lower.contains("biscuit") || lower.contains("chips") || lower.contains("snack") || lower.contains("parle") || lower.contains("oreo") || lower.contains("kurkure") || lower.contains("lays")) return "Snacks & Instant Food";
        if (lower.contains("atta") || lower.contains("rice") || lower.contains("dal") || lower.contains("salt") || lower.contains("sugar") || lower.contains("flour") || lower.contains("wheat")) return "Grocery & Staples";
        if (lower.contains("oil") || lower.contains("masala") || lower.contains("spice") || lower.contains("turmeric") || lower.contains("chilli")) return "Oils & Masalas";
        return "Grocery & Staples";
    }

    public static class ProductExtractionResult {
        public String fullProductName;
        public String brand;
        public String packageSize;
        public String category;
        public double packageQuantity;
        public ProductUnit unit;
        public double price;
        public int stock;
    }

    private ProductExtractionResult extractProductDetails(String command, String productName) {
        ProductExtractionResult res = new ProductExtractionResult();
        String combined = (productName + " " + command).toLowerCase();

        // 1. Extract brand
        res.brand = extractBrand(productName, command);

        // 2. Extract package size and unit
        Pattern pkgPattern = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(kg|kilo|kilogram|g|gm|gram|grams|ml|l|litre|liter|packet|packets|pkt|box|boxes|pcs|piece|pieces)\\b", Pattern.CASE_INSENSITIVE);
        Matcher pkgMatcher = pkgPattern.matcher(command + " " + productName);
        if (pkgMatcher.find()) {
            double val = Double.parseDouble(pkgMatcher.group(1));
            String unitStr = pkgMatcher.group(2).toLowerCase();
            res.packageQuantity = val;
            if (unitStr.startsWith("kg") || unitStr.startsWith("kilo")) {
                res.unit = ProductUnit.KG;
                res.packageSize = (val == (long) val ? String.format("%dkg", (long) val) : String.format("%.1fkg", val));
            } else if (unitStr.equals("g") || unitStr.equals("gm") || unitStr.startsWith("gram")) {
                res.unit = ProductUnit.GRAM;
                res.packageSize = (val == (long) val ? String.format("%dg", (long) val) : String.format("%.1fg", val));
            } else if (unitStr.equals("ml")) {
                res.unit = ProductUnit.ML;
                res.packageSize = (val == (long) val ? String.format("%dml", (long) val) : String.format("%.1fml", val));
            } else if (unitStr.equals("l") || unitStr.startsWith("lit")) {
                res.unit = ProductUnit.LITRE;
                res.packageSize = (val == (long) val ? String.format("%dL", (long) val) : String.format("%.1fL", val));
            } else if (unitStr.startsWith("box")) {
                res.unit = ProductUnit.BOX;
                res.packageSize = (val == (long) val ? String.format("%d Box", (long) val) : "1 Box");
            } else if (unitStr.startsWith("pack") || unitStr.startsWith("pkt")) {
                res.unit = ProductUnit.PACKET;
                res.packageSize = (val == (long) val ? String.format("%d Pkt", (long) val) : "1 Pkt");
            } else {
                res.unit = ProductUnit.PIECE;
                res.packageSize = (val == (long) val ? String.format("%d Pcs", (long) val) : "1 Pc");
            }
        } else {
            res.packageQuantity = 1.0;
            res.unit = extractUnit(combined);
            res.packageSize = "";
        }

        // 3. Category
        res.category = extractCategory(productName + " " + command);

        // 4. Price
        Double explicitPrice = extractPrice(command);
        if (explicitPrice != null) {
            res.price = explicitPrice;
        } else {
            res.price = getDefaultPriceForProduct(productName);
        }

        // 5. Stock
        res.stock = extractStockForCreation(command);

        // 6. Full product name: ensure brand is included if found, and packageSize if found
        String cleanName = capitalizeWords(productName);
        if (!res.brand.isEmpty() && !cleanName.toLowerCase().contains(res.brand.toLowerCase())) {
            cleanName = res.brand + " " + cleanName;
        }
        if (!res.packageSize.isEmpty() && !cleanName.toLowerCase().contains(res.packageSize.toLowerCase())) {
            res.fullProductName = cleanName + " " + res.packageSize;
        } else {
            res.fullProductName = cleanName;
        }

        return res;
    }

    private String extractBrand(String productName, String command) {
        String combined = (productName + " " + command).toLowerCase();
        List<String> sortedBrands = KNOWN_BRANDS.stream()
                .sorted((a, b) -> Integer.compare(b.length(), a.length()))
                .collect(Collectors.toList());
        for (String brand : sortedBrands) {
            if (combined.contains(brand.toLowerCase())) {
                return capitalizeWords(brand);
            }
        }
        String[] words = productName.trim().split("\\s+");
        if (words.length > 1 && words[0].length() > 2) {
            return capitalizeWords(words[0]);
        }
        return "";
    }
}
