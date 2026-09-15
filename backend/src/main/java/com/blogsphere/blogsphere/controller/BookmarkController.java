package com.blogsphere.blogsphere.controller;

import com.blogsphere.blogsphere.dto.BookmarkStatusResponse;
import com.blogsphere.blogsphere.model.Bookmark;
import com.blogsphere.blogsphere.model.Post;
import com.blogsphere.blogsphere.service.BookmarkService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    @PostMapping("/post/{postId}")
    public Bookmark bookmarkPost(@PathVariable Long postId){
        return bookmarkService.bookmarkPost(postId);
    }

    @DeleteMapping("/post/{postId}")
    public void removeBookmark(@PathVariable Long postId){
        bookmarkService.removeBookmark(postId);
    }

    @GetMapping("/post/{postId}/count")
    public long getBookmarkCount(@PathVariable Long postId){
        return bookmarkService.getBookmarkCount(postId);
    }

    @GetMapping("/post/{postId}/status")
    public BookmarkStatusResponse getBookmarkStatus(@PathVariable Long postId){
        return bookmarkService.getBookmarkStatus(postId);
    }

    @GetMapping("/mine")
    public List<Post> getMyBookmarks(){
        return bookmarkService.getMyBookmarkedPosts();
    }
}
