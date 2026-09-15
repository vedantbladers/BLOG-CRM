package com.blogsphere.blogsphere.service;

import com.blogsphere.blogsphere.config.RabbitMQConfig;
import com.blogsphere.blogsphere.dto.BookmarkStatusResponse;
import com.blogsphere.blogsphere.event.EventEnvelope;
import com.blogsphere.blogsphere.event.UserPostPayload;
import com.blogsphere.blogsphere.exception.ResourceNotFoundException;
import com.blogsphere.blogsphere.model.Bookmark;
import com.blogsphere.blogsphere.model.Post;
import com.blogsphere.blogsphere.model.User;
import com.blogsphere.blogsphere.repository.BookmarkRepository;
import com.blogsphere.blogsphere.repository.PostRepository;
import com.blogsphere.blogsphere.security.CurrentUserProvider;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookmarkService {
    private final BookmarkRepository bookmarkRepository;
    private final PostRepository postRepository;
    private final CurrentUserProvider currentUserProvider;
    private final RabbitTemplate rabbitTemplate;

    public BookmarkService(BookmarkRepository bookmarkRepository, PostRepository postRepository, CurrentUserProvider currentUserProvider, RabbitTemplate rabbitTemplate) {
        this.bookmarkRepository = bookmarkRepository;
        this.postRepository = postRepository;
        this.currentUserProvider = currentUserProvider;
        this.rabbitTemplate = rabbitTemplate;
    }

    public Bookmark bookmarkPost(Long postId){
        User user = currentUserProvider.getUser();
        if(bookmarkRepository.findByUserIdAndPostId(user.getId(), postId).isPresent()){
            throw new RuntimeException("Already Added to bookmark");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        Bookmark bookmark = new Bookmark();
        bookmark.setUser(user);
        bookmark.setPost(post);

        Bookmark savedBookmark = bookmarkRepository.save(bookmark);

        EventEnvelope<UserPostPayload> event = new EventEnvelope<>("BOOKMARK_CREATED", new UserPostPayload(user.getId(), postId));
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.BOOKMARK_EXCHANGE,
                RabbitMQConfig.BOOKMARK_CREATED_ROUTING_KEY,
                event
        );

        return savedBookmark;
    }

    @Transactional
    public void removeBookmark(Long postId){
        User user = currentUserProvider.getUser();

        boolean existed = bookmarkRepository.findByUserIdAndPostId(user.getId(), postId).isPresent();
        if (!existed) {
            return;
        }

        bookmarkRepository.deleteByUserIdAndPostId(user.getId(), postId);

        EventEnvelope<UserPostPayload> event = new EventEnvelope<>("BOOKMARK_DELETED", new UserPostPayload(user.getId(), postId));
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.BOOKMARK_EXCHANGE,
                RabbitMQConfig.BOOKMARK_DELETED_ROUTING_KEY,
                event
        );
    }

    public long getBookmarkCount(Long postId){
        return bookmarkRepository.countByPostId(postId);
    }

    public BookmarkStatusResponse getBookmarkStatus(Long postId){
        User user = currentUserProvider.getUser();
        boolean bookmarked = bookmarkRepository.findByUserIdAndPostId(user.getId(), postId).isPresent();
        long count = bookmarkRepository.countByPostId(postId);
        return new BookmarkStatusResponse(bookmarked, count);
    }

    public List<Post> getMyBookmarkedPosts(){
        User user = currentUserProvider.getUser();
        return bookmarkRepository.findByUserId(user.getId())
                .stream()
                .map(Bookmark::getPost)
                .toList();
    }
}
