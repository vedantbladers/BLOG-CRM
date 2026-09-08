package com.blogsphere.blogsphere.controller;

import com.blogsphere.blogsphere.dto.*;
import com.blogsphere.blogsphere.model.RefreshToken;
import com.blogsphere.blogsphere.model.User;
import com.blogsphere.blogsphere.security.JwtUtil;
import com.blogsphere.blogsphere.service.EmailService;
import com.blogsphere.blogsphere.service.RefreshTokenService;
import com.blogsphere.blogsphere.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil,
                          UserService userService, RefreshTokenService refreshTokenService, EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.refreshTokenService = refreshTokenService;
        this.emailService = emailService;
    }

    @PostMapping("/register/initiate")
    public MessageResponse registerInitiate(@Valid @RequestBody UserRequest request) {
        userService.initiateRegistration(request);
        return new MessageResponse("A verification code has been sent to " + request.getEmail() + ". Verify it to complete registration.");
    }

    @PostMapping("/register/verify")
    public User registerVerify(@Valid @RequestBody OtpVerifyRequest request) {
        return userService.completeRegistration(request);
    }

    @PostMapping("/register/resend-otp")
    public MessageResponse registerResendOtp(@Valid @RequestBody ResendOtpRequest request) {
        userService.resendRegistrationOtp(request.getEmail());
        return new MessageResponse("A new verification code has been sent to " + request.getEmail() + ".");
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // request.getUsername() may actually be an email — resolve the real
        // account and use its canonical username for the token subject and
        // any further lookups, so downstream code never has to care which
        // identifier the person logged in with.
        User user = userService.getUserByUsernameOrEmail(request.getUsername());
        String accessToken = jwtUtil.generateToken(user.getUsername());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        emailService.sendLoginAlertEmail(user.getEmail(), user.getDisplayName(), user.getUsername());

        return new AuthResponse(accessToken, refreshToken.getToken());
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(request.getRefreshToken());
        String newAccessToken = jwtUtil.generateToken(refreshToken.getUser().getUsername());

        return new AuthResponse(newAccessToken, refreshToken.getToken());
    }
}