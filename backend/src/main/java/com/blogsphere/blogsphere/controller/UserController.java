package com.blogsphere.blogsphere.controller;

import com.blogsphere.blogsphere.dto.AccountDeletionConfirmRequest;
import com.blogsphere.blogsphere.dto.MessageResponse;
import com.blogsphere.blogsphere.dto.UserRequest;
import com.blogsphere.blogsphere.model.User;
import com.blogsphere.blogsphere.security.CurrentUserProvider;
import com.blogsphere.blogsphere.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final CurrentUserProvider currentUserProvider;

    public UserController(UserService userService, CurrentUserProvider currentUserProvider) {
        this.userService = userService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping("/me")
    public User getCurrentUser() {
        return currentUserProvider.getUser();
    }

    @PostMapping
    public User createUser(@Valid @RequestBody UserRequest request){
        return userService.createUser(request);
    }

    @GetMapping
    public List<User> getAllUsers(){
        return userService.getAll();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id){
        return userService.getUserById(id);
    }

    @PatchMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody UserRequest request) {
        return userService.updateUser(id, request);
    }

    @DeleteMapping("/{id}")
    public MessageResponse requestAccountDeletion(@PathVariable Long id) {
        userService.requestAccountDeletion(id);
        return new MessageResponse("A verification code has been sent to confirm account deletion.");
    }

    @PostMapping("/{id}/resend-deletion-otp")
    public MessageResponse resendAccountDeletionOtp(@PathVariable Long id) {
        userService.requestAccountDeletion(id);
        return new MessageResponse("A new verification code has been sent to confirm account deletion.");
    }

    @PostMapping("/{id}/confirm-deletion")
    public MessageResponse confirmAccountDeletion(@PathVariable Long id, @Valid @RequestBody AccountDeletionConfirmRequest request) {
        userService.confirmAccountDeletion(id, request.getOtp());
        return new MessageResponse("Account deleted successfully.");
    }
}
