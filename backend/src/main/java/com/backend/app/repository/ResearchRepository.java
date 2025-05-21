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
import com.backend.app.model.Research;

@Repository
public interface ResearchRepository extends JpaRepository<Research, UUID>, JpaSpecificationExecutor<Research>{
	List<Research> findByProjectId(UUID projectId);
	
	@Query("SELECT r FROM Research r LEFT JOIN FETCH r.researchParticipants WHERE r.id = :id")
	Optional<Research> findByIdWithParticipants(@Param("id") UUID id);
	
	@Query("SELECT " +
		       "SUM(r.budget) as totalBudget, " +
		       "AVG(r.budget) as avgBudget, " +
		       "(SELECT r2.fundingSource FROM Research r2 GROUP BY r2.fundingSource ORDER BY COUNT(r2) DESC LIMIT 1) as commonSource, " +
		       "(SELECT COUNT(r3) FROM Research r3 WHERE r3.endDate >= CURRENT_DATE) as activeProjects " +
		       "FROM Research r")
		Map<String, Object> getResearchFundingMetrics();

}
