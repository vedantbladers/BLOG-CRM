package com.blogsphere.blogsphere.dto;

import lombok.Getter;

@Getter
public class FollowStatusResponse {

    private boolean following;
    private long followerCount;

    public FollowStatusResponse(boolean following, long followerCount) {
        this.following = following;
        this.followerCount = followerCount;
    }

}
