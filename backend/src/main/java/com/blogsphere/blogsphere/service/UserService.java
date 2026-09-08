package com.blogsphere.blogsphere.service;

import com.blogsphere.blogsphere.config.RabbitMQConfig;
import com.blogsphere.blogsphere.dto.OtpVerifyRequest;
import com.blogsphere.blogsphere.dto.UserRequest;
import com.blogsphere.blogsphere.event.EventEnvelope;
import com.blogsphere.blogsphere.event.FollowPayload;
import com.blogsphere.blogsphere.event.UserPostPayload;
import com.blogsphere.blogsphere.exception.ResourceNotFoundException;
import com.blogsphere.blogsphere.model.Comments;
import com.blogsphere.blogsphere.model.Follow;
import com.blogsphere.blogsphere.model.Like;
import com.blogsphere.blogsphere.model.Bookmark;
import com.blogsphere.blogsphere.model.OtpPurpose;
import com.blogsphere.blogsphere.model.PendingRegistration;
import com.blogsphere.blogsphere.model.Post;
import com.blogsphere.blogsphere.model.Role;
import com.blogsphere.blogsphere.model.User;
import com.blogsphere.blogsphere.repository.BookmarkRepository;
import com.blogsphere.blogsphere.repository.CommentRepository;
import com.blogsphere.blogsphere.repository.FollowRepository;
import com.blogsphere.blogsphere.repository.LikeRepository;
import com.blogsphere.blogsphere.repository.PendingRegistrationRepository;
import com.blogsphere.blogsphere.repository.PostRepository;
import com.blogsphere.blogsphere.repository.RefreshTokenRepository;
import com.blogsphere.blogsphere.repository.RevisionRepository;
import com.blogsphere.blogsphere.repository.UserRepository;
import com.blogsphere.blogsphere.security.CurrentUserProvider;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserProvider currentUserProvider;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final BookmarkRepository bookmarkRepository;
    private final FollowRepository followRepository;
    private final RevisionRepository revisionRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RabbitTemplate rabbitTemplate;
    private final EmailService emailService;
    private final OtpService otpService;
    private final PendingRegistrationRepository pendingRegistrationRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, CurrentUserProvider currentUserProvider,
                       PostRepository postRepository, CommentRepository commentRepository, LikeRepository likeRepository,
                       BookmarkRepository bookmarkRepository, FollowRepository followRepository,
                       RevisionRepository revisionRepository, RefreshTokenRepository refreshTokenRepository,
                       RabbitTemplate rabbitTemplate, EmailService emailService,
                       OtpService otpService, PendingRegistrationRepository pendingRegistrationRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentUserProvider = currentUserProvider;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.followRepository = followRepository;
        this.revisionRepository = revisionRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.emailService = emailService;
        this.otpService = otpService;
        this.pendingRegistrationRepository = pendingRegistrationRepository;
    }

    @Transactional
    public void initiateRegistration(UserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // Overwrite any previous unfinished registration attempt for this email.
        pendingRegistrationRepository.deleteByEmail(request.getEmail());

        PendingRegistration pending = new PendingRegistration();
        pending.setUsername(request.getUsername());
        pending.setEmail(request.getEmail());
        pending.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        pending.setDisplayName(request.getDisplayName());
        pending.setBio(request.getBio());
        pendingRegistrationRepository.save(pending);

        otpService.generateAndSendOtp(request.getEmail(), OtpPurpose.REGISTRATION, "complete your registration");
    }

    public void resendRegistrationOtp(String email) {
        pendingRegistrationRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No pending registration for this email"));

        otpService.generateAndSendOtp(email, OtpPurpose.REGISTRATION, "complete your registration");
    }

    @Transactional
    public User completeRegistration(OtpVerifyRequest request) {
        otpService.verifyOtp(request.getEmail(), request.getOtp(), OtpPurpose.REGISTRATION);

        PendingRegistration pending = pendingRegistrationRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No pending registration for this email"));

        User user = new User();
        user.setUsername(pending.getUsername());
        user.setEmail(pending.getEmail());
        user.setPassword(pending.getPasswordHash());
        user.setDisplayName(pending.getDisplayName());
        user.setBio(pending.getBio());

        User savedUser = userRepository.save(user);

        pendingRegistrationRepository.delete(pending);

        emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getDisplayName(), savedUser.getUsername());

        return savedUser;
    }

    public User createUser(UserRequest request){
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDisplayName(request.getDisplayName());

        User savedUser = userRepository.save(user);

        emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getDisplayName(), savedUser.getUsername());

        return savedUser;
    }

    public List<User> getAll(){
        return userRepository.findAll();
    }

    public User getUserById(Long id){
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User updateUser(Long id, UserRequest request) {
        User user = getUserById(id);
        User currentUser = currentUserProvider.getUser();

        boolean isSelf = user.getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if (!isSelf && !isAdmin) {
            throw new AccessDeniedException("You don't have permission to edit this user");
        }

        if (request.getUsername() != null) {
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        return userRepository.save(user);
    }

    public void requestAccountDeletion(Long id) {
        User user = getUserById(id);
        User currentUser = currentUserProvider.getUser();

        boolean isSelf = user.getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if (!isSelf && !isAdmin) {
            throw new AccessDeniedException("You don't have permission to delete this user");
        }

        otpService.generateAndSendOtp(user.getEmail(), OtpPurpose.ACCOUNT_DELETION, "confirm deleting your account");
    }

    @Transactional
    public void confirmAccountDeletion(Long id, String otp) {
        User user = getUserById(id);
        User currentUser = currentUserProvider.getUser();

        boolean isSelf = user.getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if (!isSelf && !isAdmin) {
            throw new AccessDeniedException("You don't have permission to delete this user");
        }

        otpService.verifyOtp(user.getEmail(), otp, OtpPurpose.ACCOUNT_DELETION);

        performDeletion(user);
    }

    private void performDeletion(User user) {
        Long userId = user.getId();

        // --- Posts this user authored, and everything attached to them ---
        List<Post> ownedPosts = postRepository.findByAuthorId(userId);
        for (Post post : ownedPosts) {
            Long postId = post.getId();

            for (Comments comment : commentRepository.findByPostId(postId)) {
                publish(RabbitMQConfig.COMMENT_EXCHANGE, RabbitMQConfig.COMMENT_DELETED_ROUTING_KEY,
                        new EventEnvelope<>("COMMENT_DELETED", comment.getId()));
            }
            for (Like like : likeRepository.findByPostId(postId)) {
                publish(RabbitMQConfig.LIKE_EXCHANGE, RabbitMQConfig.LIKE_DELETED_ROUTING_KEY,
                        new EventEnvelope<>("LIKE_DELETED", new UserPostPayload(like.getUser().getId(), postId)));
            }
            for (Bookmark bookmark : bookmarkRepository.findByPostId(postId)) {
                publish(RabbitMQConfig.BOOKMARK_EXCHANGE, RabbitMQConfig.BOOKMARK_DELETED_ROUTING_KEY,
                        new EventEnvelope<>("BOOKMARK_DELETED", new UserPostPayload(bookmark.getUser().getId(), postId)));
            }

            revisionRepository.deleteByPostId(postId);
            commentRepository.deleteByPostId(postId);
            likeRepository.deleteByPostId(postId);
            bookmarkRepository.deleteByPostId(postId);

            publish(RabbitMQConfig.POST_EXCHANGE, RabbitMQConfig.POST_DELETED_ROUTING_KEY,
                    new EventEnvelope<>("POST_DELETED", postId));
        }
        postRepository.deleteAll(ownedPosts);

        // --- This user's activity on other people's posts ---
        for (Comments comment : commentRepository.findByAuthorId(userId)) {
            publish(RabbitMQConfig.COMMENT_EXCHANGE, RabbitMQConfig.COMMENT_DELETED_ROUTING_KEY,
                    new EventEnvelope<>("COMMENT_DELETED", comment.getId()));
        }
        commentRepository.deleteByAuthorId(userId);

        for (Like like : likeRepository.findByUserId(userId)) {
            publish(RabbitMQConfig.LIKE_EXCHANGE, RabbitMQConfig.LIKE_DELETED_ROUTING_KEY,
                    new EventEnvelope<>("LIKE_DELETED", new UserPostPayload(userId, like.getPost().getId())));
        }
        likeRepository.deleteByUserId(userId);

        for (Bookmark bookmark : bookmarkRepository.findByUserId(userId)) {
            publish(RabbitMQConfig.BOOKMARK_EXCHANGE, RabbitMQConfig.BOOKMARK_DELETED_ROUTING_KEY,
                    new EventEnvelope<>("BOOKMARK_DELETED", new UserPostPayload(userId, bookmark.getPost().getId())));
        }
        bookmarkRepository.deleteByUserId(userId);

        revisionRepository.deleteByEditedById(userId);

        // --- Follow relationships, both directions ---
        for (Follow follow : followRepository.findByFollowerId(userId)) {
            publish(RabbitMQConfig.FOLLOW_EXCHANGE, RabbitMQConfig.FOLLOW_DELETED_ROUTING_KEY,
                    new EventEnvelope<>("FOLLOW_DELETED", new FollowPayload(userId, follow.getFollowing().getId())));
        }
        for (Follow follow : followRepository.findByFollowingId(userId)) {
            publish(RabbitMQConfig.FOLLOW_EXCHANGE, RabbitMQConfig.FOLLOW_DELETED_ROUTING_KEY,
                    new EventEnvelope<>("FOLLOW_DELETED", new FollowPayload(follow.getFollower().getId(), userId)));
        }
        followRepository.deleteByFollowerId(userId);
        followRepository.deleteByFollowingId(userId);

        // --- Auth artifacts (no event needed) ---
        refreshTokenRepository.deleteByUserId(userId);

        emailService.sendAccountDeletedEmail(user.getEmail(), user.getDisplayName(), user.getUsername());

        userRepository.delete(user);

        publish(RabbitMQConfig.USER_EXCHANGE, RabbitMQConfig.USER_DELETED_ROUTING_KEY,
                new EventEnvelope<>("USER_DELETED", userId));
    }

    private void publish(String exchange, String routingKey, EventEnvelope<?> event) {
        rabbitTemplate.convertAndSend(exchange, routingKey, event);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    public User getUserByUsernameOrEmail(String usernameOrEmail) {
        return userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + usernameOrEmail));
    }
}