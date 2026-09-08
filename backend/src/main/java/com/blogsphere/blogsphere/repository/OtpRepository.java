package com.blogsphere.blogsphere.repository;

import com.blogsphere.blogsphere.model.Otp;
import com.blogsphere.blogsphere.model.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(String email, OtpPurpose purpose);
    Optional<Otp> findTopByEmailAndPurposeOrderByCreatedAtDesc(String email, OtpPurpose purpose);

    // Bulk @Modifying deletes — see PendingRegistrationRepository for why:
    // Otp also uses GenerationType.IDENTITY, so a derived delete-by-select-then-remove
    // here would defer its DELETE to flush time while a subsequent save() inserts
    // immediately. No unique constraint on this table means it wouldn't crash,
    // but it would silently leave stale rows behind instead of clearing them first.
    @Modifying(clearAutomatically = true)
    @Query("delete from Otp o where o.email = :email and o.purpose = :purpose")
    void deleteByEmailAndPurpose(@Param("email") String email, @Param("purpose") OtpPurpose purpose);

    @Modifying(clearAutomatically = true)
    @Query("delete from Otp o where o.used = true or o.expiresAt < :cutoff")
    void deleteByUsedTrueOrExpiresAtBefore(@Param("cutoff") LocalDateTime cutoff);
}