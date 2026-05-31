package com.ecommerce.backend.controller;

import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.Wishlist;
import com.ecommerce.backend.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "http://localhost:5173")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping("/user/{userId}")
    public List<Product> getWishlist(@PathVariable Long userId) {
        return wishlistService.getProductsByUserId(userId);
    }

    @GetMapping("/check")
    public Map<String, Boolean> check(
            @RequestParam Long userId,
            @RequestParam Long productId) {
        return Map.of("inWishlist", wishlistService.isInWishlist(userId, productId));
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(
            @RequestParam Long userId,
            @RequestParam Long productId) {
        try {
            return ResponseEntity.ok(wishlistService.add(userId, productId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/remove")
    public ResponseEntity<Void> remove(
            @RequestParam Long userId,
            @RequestParam Long productId) {
        wishlistService.remove(userId, productId);
        return ResponseEntity.ok().build();
    }
}