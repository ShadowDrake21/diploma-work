package com.backend.app.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.app.model.Publication;
import com.backend.app.model.Research;

@Repository
public interface ResearchRepository extends JpaRepository<Research, UUID>{
	List<Research> findByProjectId(UUID projectId);
	
	@Query("SELECT r FROM Research r LEFT JOIN FETCH r.researchParticipants WHERE r.id = :id")
	Optional<Research> findByIdWithParticipants(@Param("id") UUID id);
}
