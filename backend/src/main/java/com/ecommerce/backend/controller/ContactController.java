package com.ecommerce.backend.controller;

import com.ecommerce.backend.model.Contact;
import com.ecommerce.backend.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @PostMapping("/contact")
    public ResponseEntity<?> sendMessage(@Valid @RequestBody Contact contact, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            result.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errors);
        }
        Contact saved = contactService.saveMessage(contact);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/admin/contacts")
    public ResponseEntity<List<Contact>> getAllMessages() {
        return ResponseEntity.ok(contactService.getAllMessages());
    }

    @GetMapping("/admin/contacts/pending")
    public ResponseEntity<List<Contact>> getPendingMessages() {
        return ResponseEntity.ok(contactService.getPendingMessages());
    }

    @GetMapping("/admin/contacts/{id}")
    public ResponseEntity<Contact> getMessageById(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.getMessageById(id));
    }

    @PatchMapping("/admin/contacts/{id}/status")
    public ResponseEntity<Contact> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Contact updated = contactService.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/admin/contacts/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        contactService.deleteMessage(id);
        return ResponseEntity.ok().build();
    }
}