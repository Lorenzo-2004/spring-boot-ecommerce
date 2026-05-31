package com.ecommerce.backend.service;

import com.ecommerce.backend.model.Contact;
import com.ecommerce.backend.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String adminEmail;

    public Contact saveMessage(Contact contact) {
        Contact saved = contactRepository.save(contact);
        sendAdminNotification(saved);
        sendUserConfirmation(saved);
        return saved;
    }

    public List<Contact> getAllMessages() {
        return contactRepository.findByOrderByCreatedAtDesc();
    }

    public List<Contact> getPendingMessages() {
        return contactRepository.findByStatus("PENDING");
    }

    public Contact getMessageById(Long id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
    }

    public Contact updateStatus(Long id, String status) {
        Contact contact = getMessageById(id);
        contact.setStatus(status);
        return contactRepository.save(contact);
    }

    public void deleteMessage(Long id) {
        contactRepository.deleteById(id);
    }

    private void sendAdminNotification(Contact contact) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(adminEmail);
            message.setSubject("New Contact Message: " + contact.getSubject());
            message.setText(buildAdminMessage(contact));
            mailSender.send(message);
            System.out.println("Admin notification sent to: " + adminEmail);
        } catch (Exception e) {
            System.err.println("Failed to send admin notification: " + e.getMessage());
        }
    }

    private void sendUserConfirmation(Contact contact) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(contact.getEmail());
            message.setSubject("We received your message - e-TECH Zone");
            message.setText(buildUserConfirmation(contact));
            mailSender.send(message);
            System.out.println("Confirmation sent to: " + contact.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send confirmation: " + e.getMessage());
        }
    }

    private String buildAdminMessage(Contact contact) {
        return String.format(
                "New contact message received\n\n" +
                        "Name: %s\n" +
                        "Email: %s\n" +
                        "Subject: %s\n" +
                        "Date: %s\n\n" +
                        "Message:\n%s\n\n" +
                        "Message ID: #%d\n" +
                        "Status: %s\n\n" +
                        "Reply to: %s",
                contact.getName(),
                contact.getEmail(),
                contact.getSubject(),
                contact.getCreatedAt(),
                contact.getMessage(),
                contact.getId(),
                contact.getStatus(),
                contact.getEmail()
        );
    }

    private String buildUserConfirmation(Contact contact) {
        return String.format(
                "Hello %s,\n\n" +
                        "Thank you for contacting e-TECH Zone.\n\n" +
                        "We have received your message and will respond within 24 hours.\n\n" +
                        "Your message:\n" +
                        "Subject: %s\n" +
                        "Message: %s\n\n" +
                        "Best regards,\n" +
                        "e-TECH Zone Team",
                contact.getName(),
                contact.getSubject(),
                contact.getMessage()
        );
    }
}