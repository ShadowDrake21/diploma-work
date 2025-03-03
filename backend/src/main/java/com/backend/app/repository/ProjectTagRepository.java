package com.backend.app.repository;


import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.app.model.ProjectTag;
import com.backend.app.model.ProjectTagId;

public interface ProjectTagRepository extends JpaRepository<ProjectTag, Long>{
	@Query("SELECT pt FROM ProjectTag pt WHERE pt.project.id = :projectId")
	List<ProjectTag> findByProjectId(@Param("projectId") UUID projectId);
	
	@Query("SELECT pt FROM ProjectTag pt WHERE pt.tag.id = :tagId")
	List<ProjectTag> findByTagId(@Param("tagId") UUID tagId);
	
	void deleteByProjectIdAndTagId(UUID projectId, UUID tagId);
}
