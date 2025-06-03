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

import com.backend.app.model.Patent;


@Repository
public interface PatentRepository extends JpaRepository<Patent, UUID>, JpaSpecificationExecutor<Patent>{
	List<Patent> findByProjectId(UUID projectId);
	
	@Query("SELECT p FROM Patent p LEFT JOIN FETCH p.coInventors WHERE p.id = :id")
	Optional<Patent> findByIdWithConInventors(@Param("id") UUID id);
	
	@Query("SELECT " +
		       "COUNT(p) as total, " +
		       "AVG(SIZE(p.coInventors)) as avgInventors, " +
		       "(SELECT p2.issuingAuthority FROM Patent p2 GROUP BY p2.issuingAuthority ORDER BY COUNT(p2) DESC LIMIT 1) as commonAuthority, " +
		       "(SELECT COUNT(p3) FROM Patent p3 WHERE YEAR(p3.registrationDate) = YEAR(CURRENT_DATE)) as yearPatents " +
		       "FROM Patent p")
		Map<String, Object> getPatentMetrics();
}
