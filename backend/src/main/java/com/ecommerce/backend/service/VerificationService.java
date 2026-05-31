package com.ecommerce.backend.service;

import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class VerificationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendVerificationEmail(User user) {
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        try {
            // Utilise l'URL de la configuration
            emailService.sendVerificationEmail(user.getEmail(), token);
            System.out.println("Verification link: " + frontendUrl + "/verify-email?token=" + token);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public boolean verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token).orElse(null);

        if (user == null) {
            return false;
        }

        if (user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            return false;
        }

        user.setEnabled(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);

        return true;
    }

    public boolean resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.isEnabled()) {
            return false;
        }
        sendVerificationEmail(user);
        return true;
    }
}