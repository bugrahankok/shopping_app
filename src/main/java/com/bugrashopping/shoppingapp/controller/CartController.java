package com.bugrashopping.shoppingapp.controller;

import com.bugrashopping.shoppingapp.model.Cart;
import com.bugrashopping.shoppingapp.model.CartItem;
import com.bugrashopping.shoppingapp.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable String userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<Void> addItemToCart(@PathVariable String userId, @RequestBody CartItem item) {
        cartService.addItemToCart(userId, item);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/remove/{productId}")
    public ResponseEntity<Void> removeItemFromCart(@PathVariable String userId, @PathVariable Long productId) {
        cartService.removeItemFromCart(userId, productId);
        return ResponseEntity.ok().build();
    }
}
