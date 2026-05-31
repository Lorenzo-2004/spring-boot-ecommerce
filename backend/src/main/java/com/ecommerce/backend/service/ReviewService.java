package com.ecommerce.backend.service;

import com.ecommerce.backend.model.Review;
import com.ecommerce.backend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    public List<Review> findByProductId(Long productId) {
        return reviewRepository.findByProductId(productId);
    }

    public List<Review> findByUserId(Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    public Review save(Review review) {
        if (reviewRepository.existsByUserIdAndProductId(
                review.getUser().getId(),
                review.getProduct().getId())) {
            throw new RuntimeException("Vous avez déjà noté ce produit");
        }
        return reviewRepository.save(review);
    }

    public void delete(Long id) {
        reviewRepository.deleteById(id);
    }

    public double getAverageRating(Long productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        return reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
    }
}