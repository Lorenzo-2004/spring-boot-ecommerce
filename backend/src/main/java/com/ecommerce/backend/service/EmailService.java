package com.ecommerce.backend.service;

import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final InvoiceService invoiceService;

    // Utilisez votre IP ici - CHANGEZ PAR VOTRE IP
    private static final String FRONTEND_URL = "http://192.168.43.101:5173";

    // ========== MÉTHODE POUR LA VÉRIFICATION D'EMAIL ==========

    public void sendVerificationEmail(String to, String token) {
        try {
            // Utilise l'IP au lieu de localhost
            String verificationUrl = FRONTEND_URL + "/verify-email?token=" + token;

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Arial', sans-serif; background-color: #080808; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background-color: #111111; border-radius: 12px; overflow: hidden; border: 1px solid #333333; }
                        .header { background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 30px; text-align: center; }
                        .logo { font-size: 28px; font-weight: bold; color: white; font-family: 'Georgia', serif; }
                        .content { padding: 40px 30px; color: #ffffff; }
                        .title { font-size: 24px; margin-bottom: 20px; color: #8b5cf6; }
                        .button { display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; }
                        .footer { background-color: #1a1a1a; padding: 20px; text-align: center; font-size: 12px; color: #666666; border-top: 1px solid #333333; }
                        .link { word-break: break-all; color: #8b5cf6; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div style="padding: 20px;">
                        <div class="container">
                            <div class="header">
                                <div class="logo">e-TECH Zone</div>
                            </div>
                            <div class="content">
                                <h2 class="title">Welcome to E-TECH Zone!</h2>
                                <p>Thank you for creating an account. Please verify your email address to complete your registration and start shopping.</p>
                                <div style="text-align: center;">
                                    <a href="%s" class="button">Verify Email Address</a>
                                </div>
                                <p style="margin-top: 20px;">Or copy and paste this link:</p>
                                <p class="link">%s</p>
                                <p style="font-size: 12px; color: #888; margin-top: 20px;">
                                    This link will expire in <strong>24 hours</strong>.
                                </p>
                            </div>
                            <div class="footer">
                                <p>© 2026 E-TECH Zone. All rights reserved.</p>
                                <p>If you didn't create an account, please ignore this email.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(verificationUrl, verificationUrl);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Verify Your Email - E-TECH Zone");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("Verification email sent to: " + to);
            System.out.println("Verification link: " + verificationUrl); // Debug
        } catch (Exception e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
        }
    }

    // ========== FIN NOUVELLE MÉTHODE ==========

    public void sendOrderConfirmation(Order order, User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("Order Confirmation #" + order.getId());
            helper.setText(buildOrderConfirmationEmail(order, user), false);

            mailSender.send(message);
            System.out.println("Order confirmation email sent to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send order confirmation: " + e.getMessage());
        }
    }

    public void sendPaymentConfirmation(Order order, User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("Payment Confirmed - Order #" + order.getId());
            helper.setText(buildPaymentConfirmationEmail(order, user), false);

            // Générer et attacher la facture PDF
            byte[] pdfBytes = invoiceService.generateInvoicePDF(order, user);
            if (pdfBytes != null) {
                helper.addAttachment("Invoice_" + order.getId() + ".pdf",
                        new ByteArrayResource(pdfBytes), "application/pdf");
                System.out.println("Invoice PDF attached for order #" + order.getId());
            }

            mailSender.send(message);
            System.out.println("Payment confirmation email with invoice sent to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send payment confirmation: " + e.getMessage());
        }
    }

    public void sendPaymentFailed(Order order, User user, String errorMessage) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("Payment Failed - Order #" + order.getId());
            helper.setText(buildPaymentFailedEmail(order, user, errorMessage), false);

            mailSender.send(message);
            System.out.println("Payment failed email sent to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send payment failed email: " + e.getMessage());
        }
    }

    private String buildOrderConfirmationEmail(Order order, User user) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(user.getFirstName()).append(" ").append(user.getLastName()).append(",\n\n");
        sb.append("Thank you for your order!\n\n");
        sb.append("Order #").append(order.getId()).append("\n");
        sb.append("Total: $").append(order.getTotalAmount()).append("\n");
        sb.append("Status: ").append(order.getStatus()).append("\n\n");

        sb.append("Items:\n");
        for (Order.OrderItem item : order.getItems()) {
            sb.append("- ").append(item.getProductName())
                    .append(" x").append(item.getQuantity())
                    .append(": $").append(item.getProductPrice() * item.getQuantity()).append("\n");
        }

        sb.append("\nWe will notify you when payment is confirmed.\n\n");
        sb.append("Best regards,\nThe e-TECH Zone Team");
        return sb.toString();
    }

    private String buildPaymentConfirmationEmail(Order order, User user) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(user.getFirstName()).append(" ").append(user.getLastName()).append(",\n\n");
        sb.append("Great news! Your payment has been confirmed.\n\n");
        sb.append("Order #").append(order.getId()).append("\n");
        sb.append("Amount: $").append(order.getTotalAmount()).append("\n");
        sb.append("Status: Paid\n\n");

        sb.append("Products ordered:\n");
        for (Order.OrderItem item : order.getItems()) {
            sb.append("- ").append(item.getProductName()).append(" x").append(item.getQuantity()).append("\n");
        }
        sb.append("\n");

        sb.append("Your order will be delivered within 1-5 days.\n\n");
        sb.append("Thank you for choosing us!\n\n");
        sb.append("See you soon,\n");
        sb.append("The e-TECH Zone Team");

        sb.append("\n\n---\n");
        sb.append("📎 Please find attached your invoice in PDF format.\n");
        return sb.toString();
    }

    private String buildPaymentFailedEmail(Order order, User user, String errorMessage) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(user.getFirstName()).append(" ").append(user.getLastName()).append(",\n\n");
        sb.append("We could not process your payment.\n\n");
        sb.append("Order #").append(order.getId()).append("\n");
        sb.append("Amount: $").append(order.getTotalAmount()).append("\n");
        sb.append("Error: ").append(errorMessage).append("\n\n");
        sb.append("Please try again with a different card.\n\n");
        sb.append("Best regards,\nThe e-TECH Zone Team");
        return sb.toString();
    }
}