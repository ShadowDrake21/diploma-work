package com.backend.app.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.app.model.Patent;
import com.backend.app.model.Publication;


@Repository
public interface PatentRepository extends JpaRepository<Patent, UUID>, JpaSpecificationExecutor<Patent>{
	List<Patent> findByProjectId(UUID projectId);
	@Query("SELECT p FROM Patent p LEFT JOIN FETCH p.coInventors WHERE p.id =: id")
	Optional<Patent> findByIdWithConInventors(@Param("id") UUID id);
}
