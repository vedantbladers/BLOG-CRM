package com.blogsphere.blogsphere.repository;

import com.blogsphere.blogsphere.model.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, Long> {
    Optional<PendingRegistration> findByEmail(String email);

    // Bulk @Modifying delete, not a derived delete-by-select-then-remove.
    // The derived form defers its DELETE to flush time, but PendingRegistration
    // uses GenerationType.IDENTITY, which forces a subsequent save() to INSERT
    // immediately — the INSERT can race ahead of the still-queued DELETE and
    // hit the unique constraint on email. A bulk query executes synchronously,
    // so the old row is actually gone before the new one is inserted.
    @Modifying(clearAutomatically = true)
    @Query("delete from PendingRegistration p where p.email = :email")
    void deleteByEmail(@Param("email") String email);

    @Modifying(clearAutomatically = true)
    @Query("delete from PendingRegistration p where p.createdAt < :cutoff")
    void deleteByCreatedAtBefore(@Param("cutoff") LocalDateTime cutoff);
}