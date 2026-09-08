package com.blogsphere.blogsphere.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class PostRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Slug is required")
    private String slug;

    private String content;
    @NotBlank(message = "Excerpt is required")
    private String excerpt;
    private Long categoryId;
    private Set<Long> tagIds;
}