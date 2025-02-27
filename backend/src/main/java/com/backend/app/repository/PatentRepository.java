package com.backend.app.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.app.model.Patent;
import com.backend.app.model.Publication;


@Repository
public interface PatentRepository extends JpaRepository<Patent, UUID>{
	List<Patent> findByProjectId(UUID projectId);
}
