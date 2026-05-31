package com.ecommerce.backend.controller;

import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.ProductImage;
import com.ecommerce.backend.service.CurrencyService;
import com.ecommerce.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private CurrencyService currencyService;

    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts(@RequestParam(required = false, defaultValue = "EUR") String currency) {
        List<Product> products = productService.findAll();
        List<Map<String, Object>> convertedProducts = new ArrayList<>();

        for (Product product : products) {
            Map<String, Object> converted = new HashMap<>();
            double convertedPrice = currencyService.convert(product.getPrice(), "EUR", currency);

            converted.put("id", product.getId());
            converted.put("name", product.getName());
            converted.put("description", product.getDescription());
            converted.put("priceOriginal", product.getPrice());
            converted.put("price", convertedPrice);
            converted.put("currency", currency);
            converted.put("stock", product.getStock());
            converted.put("imageUrl", product.getImageUrl());
            converted.put("category", product.getCategory());
            convertedProducts.add(converted);
        }

        return ResponseEntity.ok(convertedProducts);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id, @RequestParam(required = false, defaultValue = "EUR") String currency) {
        return productService.findById(id)
                .map(product -> {
                    Map<String, Object> converted = new HashMap<>();
                    double convertedPrice = currencyService.convert(product.getPrice(), "EUR", currency);

                    converted.put("id", product.getId());
                    converted.put("name", product.getName());
                    converted.put("description", product.getDescription());
                    converted.put("priceOriginal", product.getPrice());
                    converted.put("price", convertedPrice);
                    converted.put("currency", currency);
                    converted.put("stock", product.getStock());
                    converted.put("imageUrl", product.getImageUrl());
                    converted.put("category", product.getCategory());

                    List<String> images = new ArrayList<>();
                    if (product.getImages() != null && !product.getImages().isEmpty()) {
                        for (ProductImage img : product.getImages()) {
                            images.add(img.getImageUrl());
                        }
                    }
                    converted.put("images", images);

                    return ResponseEntity.ok(converted);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/products/category/{category}")
    public ResponseEntity<?> getByCategory(@PathVariable String category, @RequestParam(required = false, defaultValue = "EUR") String currency) {
        List<Product> products = productService.findByCategory(category);
        List<Map<String, Object>> convertedProducts = new ArrayList<>();

        for (Product product : products) {
            Map<String, Object> converted = new HashMap<>();
            double convertedPrice = currencyService.convert(product.getPrice(), "EUR", currency);

            converted.put("id", product.getId());
            converted.put("name", product.getName());
            converted.put("description", product.getDescription());
            converted.put("priceOriginal", product.getPrice());
            converted.put("price", convertedPrice);
            converted.put("currency", currency);
            converted.put("stock", product.getStock());
            converted.put("imageUrl", product.getImageUrl());
            converted.put("category", product.getCategory());
            convertedProducts.add(converted);
        }

        return ResponseEntity.ok(convertedProducts);
    }

    @GetMapping("/products/search")
    public ResponseEntity<?> searchProducts(@RequestParam String name, @RequestParam(required = false, defaultValue = "EUR") String currency) {
        List<Product> products = productService.searchByName(name);
        List<Map<String, Object>> convertedProducts = new ArrayList<>();

        for (Product product : products) {
            Map<String, Object> converted = new HashMap<>();
            double convertedPrice = currencyService.convert(product.getPrice(), "EUR", currency);

            converted.put("id", product.getId());
            converted.put("name", product.getName());
            converted.put("description", product.getDescription());
            converted.put("priceOriginal", product.getPrice());
            converted.put("price", convertedPrice);
            converted.put("currency", currency);
            converted.put("stock", product.getStock());
            converted.put("imageUrl", product.getImageUrl());
            converted.put("category", product.getCategory());
            convertedProducts.add(converted);
        }

        return ResponseEntity.ok(convertedProducts);
    }

    @GetMapping("/products/stock/low")
    public ResponseEntity<?> getLowStockProducts(@RequestParam(required = false, defaultValue = "EUR") String currency) {
        List<Product> products = productService.findLowStockProducts(10);
        List<Map<String, Object>> convertedProducts = new ArrayList<>();

        for (Product product : products) {
            Map<String, Object> converted = new HashMap<>();
            double convertedPrice = currencyService.convert(product.getPrice(), "EUR", currency);

            converted.put("id", product.getId());
            converted.put("name", product.getName());
            converted.put("description", product.getDescription());
            converted.put("priceOriginal", product.getPrice());
            converted.put("price", convertedPrice);
            converted.put("currency", currency);
            converted.put("stock", product.getStock());
            converted.put("imageUrl", product.getImageUrl());
            converted.put("category", product.getCategory());
            convertedProducts.add(converted);
        }

        return ResponseEntity.ok(convertedProducts);
    }

    @GetMapping("/products/stock/out")
    public ResponseEntity<?> getOutOfStockProducts(@RequestParam(required = false, defaultValue = "EUR") String currency) {
        List<Product> products = productService.findOutOfStockProducts();
        List<Map<String, Object>> convertedProducts = new ArrayList<>();

        for (Product product : products) {
            Map<String, Object> converted = new HashMap<>();
            double convertedPrice = currencyService.convert(product.getPrice(), "EUR", currency);

            converted.put("id", product.getId());
            converted.put("name", product.getName());
            converted.put("description", product.getDescription());
            converted.put("priceOriginal", product.getPrice());
            converted.put("price", convertedPrice);
            converted.put("currency", currency);
            converted.put("stock", product.getStock());
            converted.put("imageUrl", product.getImageUrl());
            converted.put("category", product.getCategory());
            convertedProducts.add(converted);
        }

        return ResponseEntity.ok(convertedProducts);
    }

    @GetMapping("/products/{id}/details")
    public ResponseEntity<Map<String, Object>> getProductDetails(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productService.getProductWithImages(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/products/{id}/images")
    public ResponseEntity<List<ProductImage>> getProductImages(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productService.getProductImages(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/currencies")
    public ResponseEntity<Map<String, Object>> getCurrencies() {
        return ResponseEntity.ok(currencyService.getSupportedCurrencies());
    }
}