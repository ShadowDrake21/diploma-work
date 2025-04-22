package com.backend.app.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.app.model.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID>, JpaSpecificationExecutor<Project>{
	@Query("SELECT p FROM Project p LEFT JOIN FETCH p.creator WHERE p.id = :userId")
	List<Project> findByCreatorId(@Param("userId") Long userId);
	
	@Query("SELECT p FROM Project p WHERE p.creator.id = :userId")
    List<Project> findByCreatorId2(@Param("userId") Long userId);
}
