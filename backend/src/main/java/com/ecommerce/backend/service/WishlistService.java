package com.ecommerce.backend.service;

import com.ecommerce.backend.model.Wishlist;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.repository.WishlistRepository;
import com.ecommerce.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Wishlist> getByUserId(Long userId) {
        return wishlistRepository.findByUserId(userId);
    }

    public List<Product> getProductsByUserId(Long userId) {
        List<Wishlist> wishlistItems = wishlistRepository.findByUserId(userId);
        List<Long> productIds = wishlistItems.stream()
                .map(w -> w.getProduct().getId())
                .collect(Collectors.toList());
        return productRepository.findAllById(productIds);
    }

    public boolean isInWishlist(Long userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    public Wishlist add(Long userId, Long productId) {
        if (isInWishlist(userId, productId)) {
            return null;
        }
        Wishlist wishlist = new Wishlist();
        User user = new User();
        user.setId(userId);
        Product product = new Product();
        product.setId(productId);
        wishlist.setUser(user);
        wishlist.setProduct(product);
        return wishlistRepository.save(wishlist);
    }

    @Transactional
    public void remove(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }
}