package com.blogsphere.blogsphere.controller;

import com.blogsphere.blogsphere.dto.FollowStatusResponse;
import com.blogsphere.blogsphere.model.Follow;
import com.blogsphere.blogsphere.service.FollowService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follows")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping("/user/{userId}")
    public Follow followUser(@PathVariable Long userId) {
        return followService.followUser(userId);
    }

    @DeleteMapping("/user/{userId}")
    public void unfollowUser(@PathVariable Long userId) {
        followService.unfollowUser(userId);
    }

    @GetMapping("/user/{userId}/count")
    public long getFollowerCount(@PathVariable Long userId) {
        return followService.getFollowerCount(userId);
    }

    @GetMapping("/user/{userId}/status")
    public FollowStatusResponse getFollowStatus(@PathVariable Long userId) {
        return followService.getFollowStatus(userId);
    }
}