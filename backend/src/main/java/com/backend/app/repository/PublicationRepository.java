package com.backend.app.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.app.model.Publication;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, UUID>, JpaSpecificationExecutor<Publication>{
	List<Publication> findByProjectId(UUID projectId);
	
	   @Query("SELECT p FROM Publication p " +
	           "LEFT JOIN FETCH p.project pr " +
	           "LEFT JOIN FETCH pr.creator " +
	           "LEFT JOIN FETCH p.publicationAuthors pa " +
	           "LEFT JOIN FETCH pa.user " +
	           "WHERE p.id = :id")
	Optional<Publication> findByIdWithRelations(@Param("id") UUID id);
}
