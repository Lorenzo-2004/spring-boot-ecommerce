package com.ecommerce.backend.controller;

import com.ecommerce.backend.model.User;
import com.ecommerce.backend.security.JwtUtil;
import com.ecommerce.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        System.out.println("=== REGISTER REQUEST ===");
        System.out.println("Email: " + user.getEmail());
        System.out.println("FirstName: " + user.getFirstName());
        System.out.println("LastName: " + user.getLastName());

        try {
            User saved = userService.register(user);
            saved.setPassword(null);

            String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole().name(), saved.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("user", saved);
            response.put("token", token);

            System.out.println("Registration successful for: " + saved.getEmail());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println("Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        System.out.println("=== LOGIN REQUEST ===");
        System.out.println("Email: " + email);
        System.out.println("Password provided: " + (password != null ? "yes" : "no"));

        if (email == null || email.isBlank()) {
            System.out.println("Login failed: Email is required");
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        if (password == null || password.isBlank()) {
            System.out.println("Login failed: Password is required");
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
        }

        return userService.findByEmail(email)
                .map(user -> {
                    System.out.println("User found: " + user.getEmail());
                    boolean passwordMatch = userService.checkPassword(password, user.getPassword());
                    System.out.println("Password match: " + passwordMatch);

                    if (passwordMatch) {
                        user.setPassword(null);

                        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

                        Map<String, Object> response = new HashMap<>();
                        response.put("user", user);
                        response.put("token", token);

                        System.out.println("Login successful for: " + email);

                        return ResponseEntity.ok(response);
                    }
                    System.out.println("Login failed: Invalid password for: " + email);
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid password"));
                })
                .orElseGet(() -> {
                    System.out.println("Login failed: Email not found - " + email);
                    return ResponseEntity.badRequest().body(Map.of("error", "Email not found"));
                });
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        System.out.println("=== GET PROFILE ===");
        System.out.println("User ID: " + id);

        return userService.findById(id)
                .map(found -> {
                    found.setPassword(null);
                    return ResponseEntity.ok(found);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @RequestBody Map<String, String> updates) {
        System.out.println("=== UPDATE PROFILE ===");
        System.out.println("User ID: " + id);
        System.out.println("Updates: " + updates);

        try {
            User existingUser = userService.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (updates.containsKey("firstName")) {
                String firstName = updates.get("firstName");
                if (firstName != null && !firstName.isBlank()) {
                    existingUser.setFirstName(firstName);
                }
            }

            if (updates.containsKey("lastName")) {
                String lastName = updates.get("lastName");
                if (lastName != null && !lastName.isBlank()) {
                    existingUser.setLastName(lastName);
                }
            }

            if (updates.containsKey("newPassword") && updates.get("newPassword") != null && !updates.get("newPassword").isBlank()) {
                String currentPassword = updates.get("currentPassword");
                String newPassword = updates.get("newPassword");

                if (currentPassword == null || !userService.checkPassword(currentPassword, existingUser.getPassword())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
                }

                if (newPassword.length() < 6) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
                }

                existingUser.setPassword(newPassword);
            }

            User updated = userService.update(id, existingUser);
            updated.setPassword(null);

            String token = jwtUtil.generateToken(updated.getEmail(), updated.getRole().name(), updated.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("user", updated);
            response.put("token", token);

            System.out.println("Profile updated successfully for user ID: " + id);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println("Update failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}