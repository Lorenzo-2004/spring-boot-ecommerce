package com.ecommerce.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Order is required")
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    private String transactionId;

    @NotBlank(message = "Masked card is required")
    @Pattern(regexp = "\\*{4} \\*{4} \\*{4} \\d{4}", message = "Invalid card mask format")
    private String maskedCard;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String message;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum PaymentStatus {
        SUCCESS, FAILED, PENDING
    }
}