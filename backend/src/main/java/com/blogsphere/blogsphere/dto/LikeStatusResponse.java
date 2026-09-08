package com.blogsphere.blogsphere.dto;

public class LikeStatusResponse {

    private boolean liked;
    private long count;

    public LikeStatusResponse(boolean liked, long count) {
        this.liked = liked;
        this.count = count;
    }

    public boolean isLiked() { return liked; }
    public long getCount() { return count; }
}
