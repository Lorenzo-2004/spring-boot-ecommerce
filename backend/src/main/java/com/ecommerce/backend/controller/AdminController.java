package com.ecommerce.backend.controller;

import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.ProductImage;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.service.InvoiceService;
import com.ecommerce.backend.service.OrderService;
import com.ecommerce.backend.service.ProductService;
import com.ecommerce.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productService.findAll();
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@Valid @RequestBody Product product, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            result.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            Product saved = productService.save(product);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody Product product, BindingResult result) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valid product ID is required"));
        }

        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            result.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            Product existingProduct = productService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            product.setId(id);
            Product updated = productService.save(product);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/products/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valid product ID is required"));
        }

        Integer newStock = body.get("stock");
        if (newStock == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Stock value is required"));
        }
        if (newStock < 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Stock cannot be negative"));
        }

        try {
            Product updated = productService.updateStock(id, newStock);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valid product ID is required"));
        }

        try {
            productService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderService.findAll();
    }

    @GetMapping("/orders/deliveries")
    public ResponseEntity<?> getDeliveryCalendar() {
        List<Order> allOrders = orderService.findAll();

        // Filtrer uniquement les commandes payées (PAID, SHIPPED, DELIVERED)
        List<Order> paidOrders = allOrders.stream()
                .filter(order -> order.getPaidAt() != null)
                .filter(order -> order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.CANCELLED)
                .toList();

        Map<String, List<Map<String, Object>>> calendar = new TreeMap<>();

        for (Order order : paidOrders) {
            if (order.getDeliveryDate() == null) continue;

            String dateKey = order.getDeliveryDate().toLocalDate().toString();

            Map<String, Object> orderInfo = new HashMap<>();
            orderInfo.put("id", order.getId());
            orderInfo.put("customer", order.getUser().getFirstName() + " " + order.getUser().getLastName());
            orderInfo.put("amount", order.getTotalAmount());
            orderInfo.put("items", order.getItems().size());
            orderInfo.put("status", order.getStatus().toString());
            orderInfo.put("paidAt", order.getPaidAt());
            orderInfo.put("deliveryDate", order.getDeliveryDate());
            orderInfo.put("email", order.getUser().getEmail());

            calendar.computeIfAbsent(dateKey, k -> new ArrayList<>()).add(orderInfo);
        }

        return ResponseEntity.ok(calendar);
    }

    @GetMapping("/orders/deliveries/date/{date}")
    public ResponseEntity<?> getDeliveriesByDate(@PathVariable String date) {
        try {
            LocalDate deliveryDate = LocalDate.parse(date);
            List<Order> allOrders = orderService.findAll();

            List<Map<String, Object>> deliveries = allOrders.stream()
                    .filter(order -> order.getDeliveryDate() != null)
                    .filter(order -> order.getDeliveryDate().toLocalDate().equals(deliveryDate))
                    .map(order -> {
                        Map<String, Object> orderInfo = new HashMap<>();
                        orderInfo.put("id", order.getId());
                        orderInfo.put("customer", order.getUser().getFirstName() + " " + order.getUser().getLastName());
                        orderInfo.put("amount", order.getTotalAmount());
                        orderInfo.put("items", order.getItems().size());
                        orderInfo.put("status", order.getStatus().toString());
                        orderInfo.put("paidAt", order.getPaidAt());
                        orderInfo.put("deliveryDate", order.getDeliveryDate());
                        orderInfo.put("email", order.getUser().getEmail());
                        return orderInfo;
                    })
                    .toList();

            return ResponseEntity.ok(deliveries);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format"));
        }
    }

    @PatchMapping("/orders/{orderId}/delivery-status")
    public ResponseEntity<?> updateDeliveryStatus(@PathVariable Long orderId, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        Order order = orderService.findById(orderId).orElse(null);

        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            if ("SHIPPED".equals(status)) {
                order.setStatus(Order.OrderStatus.SHIPPED);
            } else if ("DELIVERED".equals(status)) {
                order.setStatus(Order.OrderStatus.DELIVERED);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid status"));
            }

            Order saved = orderService.save(order);

            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId());
            response.put("status", saved.getStatus());
            response.put("message", "Order status updated to " + status);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/orders/statistics")
    public ResponseEntity<?> getDeliveryStatistics() {
        List<Order> allOrders = orderService.findAll();

        long totalOrders = allOrders.stream()
                .filter(order -> order.getPaidAt() != null)
                .count();

        long pendingDelivery = allOrders.stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.PAID)
                .count();

        long shipped = allOrders.stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.SHIPPED)
                .count();

        long delivered = allOrders.stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.DELIVERED)
                .count();

        double totalRevenue = allOrders.stream()
                .filter(order -> order.getPaidAt() != null)
                .mapToDouble(Order::getTotalAmount)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("pendingDelivery", pendingDelivery);
        stats.put("shipped", shipped);
        stats.put("delivered", delivered);
        stats.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/orders/{orderId}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long orderId) {
        try {
            Order order = orderService.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            User user = order.getUser();

            byte[] pdfBytes = invoiceService.generateInvoicePDF(order, user);

            if (pdfBytes == null) {
                return ResponseEntity.notFound().build();
            }

            String fileName = "INVOICE_" + orderId + ".pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        List<User> users = userService.findAll();
        users.forEach(user -> user.setPassword(null));
        return users;
    }

    @PostMapping("/products/{id}/images")
    public ResponseEntity<?> addImageToProduct(
            @PathVariable Long id,
            @RequestParam String imageUrl,
            @RequestParam(defaultValue = "0") Integer orderIndex) {

        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valid product ID is required"));
        }

        if (imageUrl == null || imageUrl.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Image URL is required"));
        }

        try {
            ProductImage image = productService.addImageToProduct(id, imageUrl, orderIndex);
            return ResponseEntity.ok(image);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/products/images/{imageId}")
    public ResponseEntity<?> deleteImage(@PathVariable Long imageId) {
        if (imageId == null || imageId <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valid image ID is required"));
        }

        try {
            productService.deleteImage(imageId);
            return ResponseEntity.ok(Map.of("message", "Image deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}