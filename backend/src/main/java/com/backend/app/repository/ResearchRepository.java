package com.backend.app.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.app.model.Publication;
import com.backend.app.model.Research;

@Repository
public interface ResearchRepository extends JpaRepository<Research, UUID>{
	List<Research> findByProjectId(UUID projectId);
}
