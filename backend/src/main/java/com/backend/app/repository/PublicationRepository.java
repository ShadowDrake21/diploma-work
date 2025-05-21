package com.backend.app.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.app.model.Publication;

/**
 * Repository interface for {@link Publication} entities with custom query methods.
 * */
@Repository
public interface PublicationRepository extends JpaRepository<Publication, UUID>, JpaSpecificationExecutor<Publication>{
	/**
	 * Finds all publications associated with a project
	 * @param projectiD The ID of the project
	 * @return List of publications for the given project
	 * */
	List<Publication> findByProjectId(UUID projectId);
	
	/**
     * Finds a publication by ID with all related entities fetched
     * @param id The ID of the publication
     * @return Optional containing the publication with all relations if found
     */
	@Query("""
	        SELECT p FROM Publication p
	        LEFT JOIN FETCH p.project pr
	        LEFT JOIN FETCH pr.creator
	        LEFT JOIN FETCH p.publicationAuthors pa
	        LEFT JOIN FETCH pa.user
	        WHERE p.id = :id
	        """)
	Optional<Publication> findByIdWithRelations(@Param("id") UUID id);
	
	@Query("SELECT " +
		       "COUNT(p) as total, " +
		       "AVG(p.endPage - p.startPage) as avgPages, " +
		       "(SELECT p2.publicationSource FROM Publication p2 GROUP BY p2.publicationSource ORDER BY COUNT(p2) DESC LIMIT 1) as commonSource, " +
		       "(SELECT COUNT(p3) FROM Publication p3 WHERE YEAR(p3.publicationDate) = YEAR(CURRENT_DATE)) as yearPublications " +
		       "FROM Publication p")
		Map<String, Object> getPublicationMetrics();
}
