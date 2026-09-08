package com.blogsphere.blogsphere.service;

import com.blogsphere.blogsphere.config.RabbitMQConfig;
import com.blogsphere.blogsphere.dto.LikeStatusResponse;
import com.blogsphere.blogsphere.event.EventEnvelope;
import com.blogsphere.blogsphere.event.UserPostPayload;
import com.blogsphere.blogsphere.exception.ResourceNotFoundException;
import com.blogsphere.blogsphere.model.Like;
import com.blogsphere.blogsphere.model.Post;
import com.blogsphere.blogsphere.model.User;
import com.blogsphere.blogsphere.repository.LikeRepository;
import com.blogsphere.blogsphere.repository.PostRepository;
import com.blogsphere.blogsphere.security.CurrentUserProvider;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LikeService {
    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final CurrentUserProvider currentUserProvider;
    private final RabbitTemplate rabbitTemplate;
    private final EmailService emailService;

    public LikeService(LikeRepository likeRepository, PostRepository postRepository, CurrentUserProvider currentUserProvider, RabbitTemplate rabbitTemplate, EmailService emailService) {
        this.likeRepository = likeRepository;
        this.postRepository = postRepository;
        this.currentUserProvider = currentUserProvider;
        this.rabbitTemplate = rabbitTemplate;
        this.emailService = emailService;
    }

    public Like likePost(Long postId){
        User user = currentUserProvider.getUser();

        if(likeRepository.findByUserIdAndPostId(user.getId(), postId).isPresent()){
            throw new RuntimeException("Already Liked");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        Like like = new Like();
        like.setUser(user);
        like.setPost(post);
        Like savedLike = likeRepository.save(like);

        User postAuthor = post.getAuthor();
        if (!postAuthor.getId().equals(user.getId())) {
            emailService.sendNewLikeEmail(postAuthor.getEmail(), postAuthor.getDisplayName(),
                    user.getDisplayName(), user.getUsername(), post.getTitle());
        }

        EventEnvelope<UserPostPayload> event = new EventEnvelope<>("LIKE_CREATED", new UserPostPayload(user.getId(), postId));
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.LIKE_EXCHANGE,
                RabbitMQConfig.LIKE_CREATED_ROUTING_KEY,
                event
        );

        return savedLike;
    }

    @Transactional
    public void unlikePost(Long postId){
        User user = currentUserProvider.getUser();

        boolean existed = likeRepository.findByUserIdAndPostId(user.getId(), postId).isPresent();
        if (!existed) {
            return;
        }

        likeRepository.deleteByUserIdAndPostId(user.getId(), postId);

        EventEnvelope<UserPostPayload> event = new EventEnvelope<>("LIKE_DELETED", new UserPostPayload(user.getId(), postId));
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.LIKE_EXCHANGE,
                RabbitMQConfig.LIKE_DELETED_ROUTING_KEY,
                event
        );
    }

    public long getLikeCount(Long postId){
        return likeRepository.countByPostId(postId);
    }

    public LikeStatusResponse getLikeStatus(Long postId){
        User user = currentUserProvider.getUser();
        boolean liked = likeRepository.findByUserIdAndPostId(user.getId(), postId).isPresent();
        long count = likeRepository.countByPostId(postId);
        return new LikeStatusResponse(liked, count);
    }
}
