package com.ecommerce.backend.controller;

import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.Payment;
import com.ecommerce.backend.service.OrderService;
import com.ecommerce.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderService orderService;

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(
            @RequestParam Long orderId,
            @RequestParam String cardNumber,
            @RequestParam String expiryDate,
            @RequestParam String cvv) {

        // Validation des paramètres
        if (orderId == null || orderId <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valid order ID is required"));
        }

        if (cardNumber == null || cardNumber.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Card number is required"));
        }

        if (expiryDate == null || expiryDate.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Expiration date is required"));
        }

        if (cvv == null || cvv.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "CVV is required"));
        }

        String cleanedCardNumber = cardNumber.replaceAll("\\s", "");
        if (!cleanedCardNumber.matches("\\d{13,19}")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid card number format. Must contain 13-19 digits"));
        }

        // Validation de la date d'expiration
        if (!isValidExpiryDate(expiryDate)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Card has expired. Please use a valid card."));
        }

        // Validation du CVV
        if (!cvv.matches("\\d{3,4}")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid CVV. Must be 3 or 4 digits."));
        }

        return orderService.findById(orderId)
                .map(order -> {
                    Payment payment = paymentService.processPayment(order, cleanedCardNumber, expiryDate, cvv);

                    Map<String, Object> response = new HashMap<>();
                    response.put("status", payment.getStatus());
                    response.put("transactionId", payment.getTransactionId());
                    response.put("message", payment.getMessage());
                    response.put("orderId", order.getId());
                    response.put("amount", order.getTotalAmount());

                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.badRequest().body(Map.of("error", "Order not found with ID: " + orderId)));
    }

    private boolean isValidExpiryDate(String expiryDate) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/yy");
            YearMonth cardExpiry = YearMonth.parse(expiryDate, formatter);
            YearMonth currentMonth = YearMonth.now();
            return !cardExpiry.isBefore(currentMonth);
        } catch (Exception e) {
            return false;
        }
    }
}