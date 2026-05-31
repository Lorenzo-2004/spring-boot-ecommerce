package com.ecommerce.backend.service;

import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.ProductImage;
import com.ecommerce.backend.repository.ProductImageRepository;
import com.ecommerce.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    public List<Product> findAll() {
        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            List<ProductImage> images = productImageRepository.findByProductIdOrderByOrderIndexAsc(product.getId());
            product.setImages(images);
        }
        return products;
    }

    public Optional<Product> findById(Long id) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            List<ProductImage> images = productImageRepository.findByProductIdOrderByOrderIndexAsc(id);
            product.setImages(images);
        }
        return productOpt;
    }

    public List<Product> findByCategory(String category) {
        List<Product> products = productRepository.findByCategory(category);
        for (Product product : products) {
            List<ProductImage> images = productImageRepository.findByProductIdOrderByOrderIndexAsc(product.getId());
            product.setImages(images);
        }
        return products;
    }

    public List<Product> searchByName(String name) {
        List<Product> products = productRepository.findByNameContainingIgnoreCase(name);
        for (Product product : products) {
            List<ProductImage> images = productImageRepository.findByProductIdOrderByOrderIndexAsc(product.getId());
            product.setImages(images);
        }
        return products;
    }

    @Transactional
    public Product save(Product product) {
        if (product.getId() == null) {
            Optional<Product> existingProduct = productRepository.findByName(product.getName());
            if (existingProduct.isPresent()) {
                throw new RuntimeException("Product with name '" + product.getName() + "' already exists");
            }
        }
        Product saved = productRepository.save(product);

        if (product.getImages() != null && !product.getImages().isEmpty()) {
            for (ProductImage image : product.getImages()) {
                if (image.getId() == null) {
                    image.setProduct(saved);
                    productImageRepository.save(image);
                }
            }
        }

        return saved;
    }

    @Transactional
    public void delete(Long id) {
        List<ProductImage> images = productImageRepository.findByProductIdOrderByOrderIndexAsc(id);
        if (!images.isEmpty()) {
            productImageRepository.deleteAll(images);
            System.out.println("Deleted " + images.size() + " images for product " + id);
        }
        productRepository.deleteById(id);
        System.out.println("Product deleted successfully with ID: " + id);
    }

    public List<Product> findLowStockProducts(int threshold) {
        List<Product> products = productRepository.findByStockLessThanEqual(threshold);
        for (Product product : products) {
            List<ProductImage> images = productImageRepository.findByProductIdOrderByOrderIndexAsc(product.getId());
            product.setImages(images);
        }
        return products;
    }

    public List<Product> findOutOfStockProducts() {
        List<Product> products = productRepository.findByStock(0);
        for (Product product : products) {
            List<ProductImage> images = productImageRepository.findByProductIdOrderByOrderIndexAsc(product.getId());
            product.setImages(images);
        }
        return products;
    }

    @Transactional
    public Product updateStock(Long id, int newStock) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStock(newStock);
        return productRepository.save(product);
    }

    @Transactional
    public boolean checkStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return product.getStock() >= quantity;
    }

    @Transactional
    public void reduceStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (product.getStock() >= quantity) {
            product.setStock(product.getStock() - quantity);
            productRepository.save(product);
        } else {
            throw new RuntimeException("Insufficient stock for product: " + product.getName());
        }
    }

    public Map<String, Object> getProductWithImages(Long id) {
        Optional<Product> productOpt = findById(id);
        if (productOpt.isEmpty()) {
            throw new RuntimeException("Product not found");
        }

        Product product = productOpt.get();
        List<ProductImage> images = productImageRepository.findByProductIdOrderByOrderIndexAsc(id);

        List<Map<String, Object>> imageList = new ArrayList<>();
        for (ProductImage image : images) {
            Map<String, Object> img = new HashMap<>();
            img.put("id", image.getId());
            img.put("imageUrl", image.getImageUrl());
            img.put("orderIndex", image.getOrderIndex());
            imageList.add(img);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", product.getId());
        response.put("name", product.getName());
        response.put("description", product.getDescription());
        response.put("price", product.getPrice());
        response.put("stock", product.getStock());
        response.put("imageUrl", product.getImageUrl());
        response.put("category", product.getCategory());
        response.put("images", imageList);

        return response;
    }

    public List<ProductImage> getProductImages(Long productId) {
        return productImageRepository.findByProductIdOrderByOrderIndexAsc(productId);
    }

    public ProductImage addImageToProduct(Long productId, String imageUrl, Integer orderIndex) {
        Optional<Product> productOpt = findById(productId);
        if (productOpt.isEmpty()) {
            throw new RuntimeException("Product not found");
        }

        Product product = productOpt.get();
        ProductImage image = new ProductImage();
        image.setImageUrl(imageUrl);
        image.setOrderIndex(orderIndex);
        image.setProduct(product);

        return productImageRepository.save(image);
    }

    public List<ProductImage> addMultipleImages(Long productId, List<String> imageUrls) {
        Optional<Product> productOpt = findById(productId);
        if (productOpt.isEmpty()) {
            throw new RuntimeException("Product not found");
        }

        Product product = productOpt.get();
        List<ProductImage> savedImages = new ArrayList<>();

        for (int i = 0; i < imageUrls.size(); i++) {
            ProductImage image = new ProductImage();
            image.setImageUrl(imageUrls.get(i));
            image.setOrderIndex(i);
            image.setProduct(product);
            savedImages.add(productImageRepository.save(image));
        }

        return savedImages;
    }

    public void deleteImage(Long imageId) {
        productImageRepository.deleteById(imageId);
    }

    public ProductImage updateImageOrder(Long imageId, Integer orderIndex) {
        Optional<ProductImage> imageOpt = productImageRepository.findById(imageId);
        if (imageOpt.isEmpty()) {
            throw new RuntimeException("Image not found");
        }

        ProductImage image = imageOpt.get();
        image.setOrderIndex(orderIndex);
        return productImageRepository.save(image);
    }
}