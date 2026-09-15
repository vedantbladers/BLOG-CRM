package com.blogsphere.blogsphere.dto;

import lombok.Getter;

@Getter
public class BookmarkStatusResponse {

    private boolean bookmarked;
    private long count;

    public BookmarkStatusResponse(boolean bookmarked, long count) {
        this.bookmarked = bookmarked;
        this.count = count;
    }

}
