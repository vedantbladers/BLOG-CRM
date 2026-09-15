package com.blogsphere.blogsphere.service;

import com.blogsphere.blogsphere.config.RabbitMQConfig;
import com.blogsphere.blogsphere.dto.FollowStatusResponse;
import com.blogsphere.blogsphere.event.EventEnvelope;
import com.blogsphere.blogsphere.event.FollowPayload;
import com.blogsphere.blogsphere.exception.ResourceNotFoundException;
import com.blogsphere.blogsphere.model.Follow;
import com.blogsphere.blogsphere.model.User;
import com.blogsphere.blogsphere.repository.FollowRepository;
import com.blogsphere.blogsphere.repository.UserRepository;
import com.blogsphere.blogsphere.security.CurrentUserProvider;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;
    private final RabbitTemplate rabbitTemplate;
    private final EmailService emailService;

    public FollowService(FollowRepository followRepository, UserRepository userRepository, CurrentUserProvider currentUserProvider, RabbitTemplate rabbitTemplate, EmailService emailService) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.currentUserProvider = currentUserProvider;
        this.rabbitTemplate = rabbitTemplate;
        this.emailService = emailService;
    }

    public Follow followUser(Long followingId) {

        User follower = currentUserProvider.getUser();

        if (followingId.equals(follower.getId())) {
            throw new RuntimeException("Cannot follow yourself");
        }

        if (followRepository.findByFollowerIdAndFollowingId(follower.getId(), followingId).isPresent()) {
            throw new RuntimeException("Already following");
        }

        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + followingId));

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowing(following);

        Follow savedFollow = followRepository.save(follow);

        emailService.sendNewFollowerEmail(following.getEmail(), following.getDisplayName(),
                follower.getDisplayName(), follower.getUsername());

        EventEnvelope<FollowPayload> event = new EventEnvelope<>("FOLLOW_CREATED", new FollowPayload(follower.getId(), followingId));
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.FOLLOW_EXCHANGE,
                RabbitMQConfig.FOLLOW_CREATED_ROUTING_KEY,
                event
        );

        return savedFollow;
    }

    @Transactional
    public void unfollowUser(Long followingId) {
        User user = currentUserProvider.getUser();

        boolean existed = followRepository.findByFollowerIdAndFollowingId(user.getId(), followingId).isPresent();
        if (!existed) {
            return;
        }

        followRepository.deleteByFollowerIdAndFollowingId(user.getId(), followingId);

        EventEnvelope<FollowPayload> event = new EventEnvelope<>("FOLLOW_DELETED", new FollowPayload(user.getId(), followingId));
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.FOLLOW_EXCHANGE,
                RabbitMQConfig.FOLLOW_DELETED_ROUTING_KEY,
                event
        );
    }

    public long getFollowerCount(Long userId) {
        return followRepository.countByFollowingId(userId);
    }

    public FollowStatusResponse getFollowStatus(Long userId) {
        User currentUser = currentUserProvider.getUser();
        boolean following = followRepository.findByFollowerIdAndFollowingId(currentUser.getId(), userId).isPresent();
        long followerCount = followRepository.countByFollowingId(userId);
        return new FollowStatusResponse(following, followerCount);
    }
}