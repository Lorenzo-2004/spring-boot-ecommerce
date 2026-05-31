package com.ecommerce.backend.controller;

import com.ecommerce.backend.service.VerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class VerificationController {

    @Autowired
    private VerificationService verificationService;

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        boolean verified = verificationService.verifyEmail(token);

        Map<String, String> response = new HashMap<>();
        if (verified) {
            response.put("message", "Email verified successfully! You can now login.");
            return ResponseEntity.ok(response);
        } else {
            response.put("error", "Invalid or expired verification token");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestParam String email) {
        boolean sent = verificationService.resendVerificationEmail(email);

        Map<String, String> response = new HashMap<>();
        if (sent) {
            response.put("message", "Verification email sent successfully!");
            return ResponseEntity.ok(response);
        } else {
            response.put("error", "User not found or already verified");
            return ResponseEntity.badRequest().body(response);
        }
    }
}