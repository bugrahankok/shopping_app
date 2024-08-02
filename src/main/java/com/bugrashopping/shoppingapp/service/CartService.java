package com.bugrashopping.shoppingapp.service;

import com.bugrashopping.shoppingapp.model.Cart;
import com.bugrashopping.shoppingapp.model.CartItem;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class CartService {
    private Map<String, Cart> userCarts = new HashMap<>();

    public Cart getCart(String userId) {
        return  userCarts.computeIfAbsent(userId, k -> new Cart());
    }

    public void addItemToCart(String userId, CartItem item) {
        Cart cart = getCart(userId);
        cart.addItem(item);
    }

    public void removeItemFromCart (String userId, Long productId) {
        Cart cart = getCart(userId);
        cart.removeItem(productId);
    }
}
