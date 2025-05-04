package com.backend.app.repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.app.model.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID>, JpaSpecificationExecutor<Project> {
	@Query("SELECT p FROM Project p JOIN FETCH p.creator WHERE p.creator.id = :userId")
	List<Project> findProjectsWithCreatorByUserId(@Param("userId") Long userId);

	@Query("SELECT p FROM Project p WHERE p.creator.id = :userId")
    Page<Project> findByCreatorId(@Param("userId") Long userId, Pageable pageable);
	
	@Query("SELECT p FROM Project p WHERE p.creator.id = :userId")
    List<Project> findByCreatorId(@Param("userId") Long userId);


	@Query("SELECT p FROM Project p ORDER BY p.createdAt DESC")
	Page<Project> findNewsestProjects(Pageable pageable);

	@Query("""
		SELECT new map(
			COUNT(p) as totalProjects,
			SUM(CASE WHEN p.type = 'PUBLICATION' THEN 1 ELSE 0 END) as totalPublications,
			SUM(CASE WHEN p.type = 'PATENT' THEN 1 ELSE 0 END) as totalPatents,
			SUM(CASE WHEN p.type = 'RESEARCH' THEN 1 ELSE 0 END) as totalResearch)
			FROM Project p
		""")
	Map<String, Long> countProjectsByType();
}
