package com.backend.app.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;

import com.backend.app.model.AdminInvitation;

public interface AdminInvitationRepository extends JpaRepository<AdminInvitation, Long> {
	Optional<AdminInvitation> findByEmail(String email);
	Optional<AdminInvitation> findByToken(String token);
	@NonNull
	Page<AdminInvitation> findAll(@NonNull Pageable pageable);
	boolean existsByEmailAndCompletedFalseAndRevokedFalse(String email);
	
    long countByCompletedFalseAndRevokedFalse();

}
