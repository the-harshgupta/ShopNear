package com.retail.platform.service;

import com.retail.platform.model.*;
import com.retail.platform.repository.CartItemRepository;
import com.retail.platform.repository.CartRepository;
import com.retail.platform.repository.StoreProductRepository;
import com.retail.platform.repository.StoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final StoreProductRepository storeProductRepository;
    private final StoreRepository storeRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       StoreProductRepository storeProductRepository,
                       StoreRepository storeRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.storeProductRepository = storeProductRepository;
        this.storeRepository = storeRepository;
    }

    /**
     * Retrieves or creates the store-specific cart for a given customer and store.
     */
    public Cart getOrCreateCart(Long customerId, Long storeId) {
        if (customerId == null || storeId == null) {
            throw new IllegalArgumentException("customerId and storeId must not be null");
        }
        return cartRepository.findByCustomerIdAndStoreId(customerId, storeId)
                .orElseGet(() -> cartRepository.save(new Cart(customerId, storeId)));
    }

    /**
     * Adds an item to the store-specific cart with strict validation:
     * 1. Product must belong to the specified store.
     * 2. Stock must be available.
     * 3. Store-specific price is captured.
     */
    public CartItem addItem(Long customerId, Long storeId, Long storeProductId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found with id: " + storeId));

        StoreProduct storeProduct = storeProductRepository.findById(storeProductId)
                .orElseThrow(() -> new IllegalArgumentException("StoreProduct not found with id: " + storeProductId));

        // Enforce store matching
        if (!storeProduct.getStore().getId().equals(storeId)) {
            throw new IllegalArgumentException("StoreProduct does not belong to store " + storeId + " (" + store.getName() + ")");
        }

        Cart cart = getOrCreateCart(customerId, storeId);

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndStoreProductId(cart.getId(), storeProductId);
        CartItem cartItem;

        int currentCartQty = existingItemOpt.map(CartItem::getQuantity).orElse(0);
        int targetQty = currentCartQty + quantity;

        if (targetQty > storeProduct.getStockQuantity()) {
            throw new IllegalArgumentException("Requested quantity (" + targetQty + ") exceeds available stock (" + storeProduct.getStockQuantity() + ")");
        }

        if (existingItemOpt.isPresent()) {
            cartItem = existingItemOpt.get();
            cartItem.setQuantity(targetQty);
            cartItem.setPrice(storeProduct.getPrice()); // update to latest store price
        } else {
            cartItem = new CartItem(cart, storeProduct, quantity, storeProduct.getPrice());
            cart.addItem(cartItem);
        }

        return cartItemRepository.save(cartItem);
    }

    /**
     * Updates quantity for an existing cart item with customer authorization check.
     */
    public CartItem updateQuantity(Long customerId, Long cartItemId, int newQuantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found with id: " + cartItemId));

        if (!cartItem.getCart().getCustomerId().equals(customerId)) {
            throw new SecurityException("Forbidden: Not authorized to modify this cart item");
        }

        if (newQuantity <= 0) {
            cartItem.getCart().removeItem(cartItem);
            cartItemRepository.delete(cartItem);
            return null;
        }

        StoreProduct sp = cartItem.getStoreProduct();
        if (newQuantity > sp.getStockQuantity()) {
            throw new IllegalArgumentException("Requested quantity (" + newQuantity + ") exceeds available stock (" + sp.getStockQuantity() + ")");
        }

        cartItem.setQuantity(newQuantity);
        cartItem.setPrice(sp.getPrice());
        return cartItemRepository.save(cartItem);
    }

    /**
     * Removes an item from the cart with customer authorization check.
     */
    public void removeItem(Long customerId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found with id: " + cartItemId));

        if (!cartItem.getCart().getCustomerId().equals(customerId)) {
            throw new SecurityException("Forbidden: Not authorized to remove this cart item");
        }

        cartItem.getCart().removeItem(cartItem);
        cartItemRepository.delete(cartItem);
    }

    /**
     * Clears all items in the store-specific cart (e.g. after successful order checkout).
     */
    public void clearCart(Long customerId, Long storeId) {
        Optional<Cart> cartOpt = cartRepository.findByCustomerIdAndStoreId(customerId, storeId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            cart.clearItems();
            cartRepository.save(cart);
        }
    }

    /**
     * Returns a detailed summary of the customer's cart for a given store.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCartSummary(Long customerId, Long storeId) {
        Store store = storeRepository.findById(storeId).orElse(null);
        String storeName = store != null ? store.getName() : "Store #" + storeId;

        Optional<Cart> cartOpt = cartRepository.findByCustomerIdAndStoreId(customerId, storeId);

        List<Map<String, Object>> itemSummaries = new ArrayList<>();
        int totalItems = 0;
        double totalAmount = 0.0;

        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            for (CartItem item : cart.getItems()) {
                StoreProduct sp = item.getStoreProduct();
                Product p = sp.getProduct();

                double itemTotal = item.getPrice() * item.getQuantity();
                totalItems += item.getQuantity();
                totalAmount += itemTotal;

                Map<String, Object> it = new LinkedHashMap<>();
                it.put("cartItemId", item.getId());
                it.put("storeProductId", sp.getId());
                it.put("productId", p != null ? p.getId() : null);
                it.put("name", p != null ? p.getName() : "Item");
                it.put("brand", p != null ? p.getBrand() : "");
                it.put("imageUrl", p != null ? p.getImageUrl() : null);
                it.put("price", item.getPrice());
                it.put("mrp", sp.getMrp() != null ? sp.getMrp() : item.getPrice());
                it.put("unit", sp.getUnit() != null ? sp.getUnit().name() : "PIECE");
                it.put("packageQuantity", sp.getPackageQuantity());
                it.put("aisle", sp.getAisleNumber() != null ? sp.getAisleNumber() : "");
                it.put("quantity", item.getQuantity());
                it.put("stockQuantity", sp.getStockQuantity());
                it.put("itemTotal", Math.round(itemTotal * 100.0) / 100.0);
                itemSummaries.add(it);
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("customerId", customerId);
        response.put("storeId", storeId);
        response.put("storeName", storeName);
        response.put("items", itemSummaries);
        response.put("totalItems", totalItems);
        response.put("distinctItems", itemSummaries.size());
        response.put("totalAmount", Math.round(totalAmount * 100.0) / 100.0);

        return response;
    }
}
