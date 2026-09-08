package com.blogsphere.blogsphere.controller;

import com.blogsphere.blogsphere.dto.LikeStatusResponse;
import com.blogsphere.blogsphere.model.Like;
import com.blogsphere.blogsphere.service.LikeService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @PostMapping("/post/{postId}")
    public Like likePost(@PathVariable Long postId){
        return likeService.likePost(postId);
    }

    @DeleteMapping("/post/{postId}")
    public void unlikePost(@PathVariable Long postId){
        likeService.unlikePost(postId);
    }

    @GetMapping("/post/{postId}/count")
    public long getLikesCount(@PathVariable Long postId){
        return likeService.getLikeCount(postId);
    }

    @GetMapping("/post/{postId}/status")
    public LikeStatusResponse getLikeStatus(@PathVariable Long postId){
        return likeService.getLikeStatus(postId);
    }
}
