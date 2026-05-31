package com.ecommerce.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User is required")
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotEmpty(message = "Order must contain at least one item")
    @ElementCollection
    @CollectionTable(name = "order_items")
    private List<OrderItem> items;

    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime paidAt;

    private LocalDateTime deliveryDate;

    @Column(nullable = false)
    private String currency = "EUR";

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        status = OrderStatus.PENDING;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
        if (paidAt != null) {
            this.deliveryDate = paidAt.plusDays(5);
        }
    }

    public enum OrderStatus {
        PENDING, PAID, SHIPPED, DELIVERED, CANCELLED
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    public static class OrderItem {

        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotBlank(message = "Product name is required")
        private String productName;

        @NotNull(message = "Product price is required")
        @Positive(message = "Product price must be positive")
        private Double productPrice;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        @Max(value = 999, message = "Quantity cannot exceed 999")
        private Integer quantity;
    }
}