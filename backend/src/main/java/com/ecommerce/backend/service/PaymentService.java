package com.ecommerce.backend.service;

import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.Payment;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.PaymentRepository;
import com.ecommerce.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderService orderService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public Payment processPayment(Order order, String cardNumber, String expiryDate, String cvv) {
        User user = order.getUser();

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setMaskedCard(maskCard(cardNumber));

        String cardType = getCardType(cardNumber);

        // Validation de la date d'expiration
        if (!isValidExpiryDate(expiryDate)) {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setMessage("Payment failed: Card expired. Please use a valid card.");

            if (user != null && user.getEmail() != null) {
                emailService.sendPaymentFailed(order, user, "Payment failed: Your card has expired.");
            }

            return paymentRepository.save(payment);
        }

        if (isValidCard(cardNumber)) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setTransactionId(UUID.randomUUID().toString());
            payment.setMessage("Payment accepted - " + cardType);

            // Mise à jour du statut de la commande
            orderService.updateStatus(order.getId(), Order.OrderStatus.PAID);

            // Enregistrer la date de paiement et calculer la date de livraison
            order.setPaidAt(LocalDateTime.now());
            orderService.save(order);

            // Mise à jour du stock
            for (Order.OrderItem item : order.getItems()) {
                Product product = productRepository.findById(item.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductId()));
                int newStock = product.getStock() - item.getQuantity();
                if (newStock < 0) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName());
                }
                product.setStock(newStock);
                productRepository.save(product);
            }

            if (user != null && user.getEmail() != null) {
                emailService.sendPaymentConfirmation(order, user);
            }

        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setMessage("Card declined. Please use Visa, Mastercard or American Express");

            if (user != null && user.getEmail() != null) {
                emailService.sendPaymentFailed(order, user, "Card declined. Please use Visa (starts with 4), Mastercard (starts with 5) or American Express (starts with 3).");
            }
        }

        return paymentRepository.save(payment);
    }

    private boolean isValidExpiryDate(String expiryDate) {
        try {
            // Format attendu: MM/YY
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/yy");
            YearMonth cardExpiry = YearMonth.parse(expiryDate, formatter);
            YearMonth currentMonth = YearMonth.now();

            // Vérifie si la carte est expirée
            if (cardExpiry.isBefore(currentMonth)) {
                return false;
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isValidCard(String cardNumber) {
        String cleaned = cardNumber.replaceAll("\\s", "");
        return cleaned.startsWith("4") || cleaned.startsWith("5") || cleaned.startsWith("3");
    }

    private String getCardType(String cardNumber) {
        String cleaned = cardNumber.replaceAll("\\s", "");
        if (cleaned.startsWith("4")) return "Visa";
        if (cleaned.startsWith("5")) return "Mastercard";
        if (cleaned.startsWith("3")) return "American Express";
        return "Unknown";
    }

    private String maskCard(String cardNumber) {
        String cleaned = cardNumber.replaceAll("\\s", "");
        if (cleaned.length() >= 4) {
            return "**** **** **** " + cleaned.substring(cleaned.length() - 4);
        }
        return "****";
    }
}