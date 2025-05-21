package com.backend.app.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.backend.app.dto.miscellaneous.ProjectSearchCriteria;
import com.backend.app.enums.ProjectType;
import com.backend.app.model.Project;
import com.backend.app.model.Tag;
import com.backend.app.repository.TagRepository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import jakarta.persistence.criteria.CriteriaBuilder.Case;
import jakarta.persistence.criteria.*;
@Service
@RequiredArgsConstructor
public class ProjectSpecificationService {
	private final PublicationService publicationService;
	private final PatentService patentService;
	private final ResearchService researchService;	
	
	public Specification<Project> buildSpecification(ProjectSearchCriteria criteria) {
		return Specification.where(withSearchQuery(criteria.getSearch()))
				.and(withTypes(criteria.getTypes()))
				.and(withTags(criteria.getTags()))
				.and(withDateRange(criteria.getStartDate(), criteria.getEndDate()))
                .and(withProgressRange(criteria.getProgressMin(), criteria.getProgressMax()))
                .and(withPublicationFilters(criteria.getPublicationSource(), criteria.getDoiIsbn()))
                .and(withResearchFilters(criteria.getMinBudget(), criteria.getMaxBudget(), criteria.getFundingSource()))
                .and(withPatentFilters(criteria.getRegistrationNumber(), criteria.getIssuingAuthority()));
	}
	
	private Specification<Project> withSearchQuery(String search) {
		return (root, query, cb) -> search == null || search.isEmpty() ? cb.conjunction() : cb.or(
                cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"),
                cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%")
            );
	}
	
	private Specification<Project> withTypes(List<ProjectType> types) {
		return (root, query, cb) -> 
		types == null || types.isEmpty() ? cb.conjunction() : root.get("type").in(types);
	}
	
	private Specification<Project> withTags(List<UUID> tagIds){
		return (root, query, cb) -> {
			if(tagIds == null || tagIds.isEmpty()) {
				return cb.conjunction();
			}
			Join<Project, Tag> tagJoin = root.join("tags");
			return tagJoin.get("id").in(tagIds);
		};
	}
	
	private Specification<Project> withDateRange(LocalDate startDate, LocalDate endDate) {
		 return (root, query, cb) -> {
			 Path<LocalDateTime> createdAt = root.get("createdAt");
		        if (startDate != null && endDate != null) {
		            return cb.between(
		            	createdAt, 
		                startDate.atStartOfDay(), 
		                endDate.atTime(23, 59, 59)
		            );
		        } 
		        if (startDate != null) {
		            return cb.greaterThanOrEqualTo(
		            	createdAt, 
		                startDate.atStartOfDay()
		            );
		        } 
		        if (endDate != null) {
		            return cb.lessThanOrEqualTo(
		            	createdAt, 
		                endDate.atTime(23, 59, 59)
		            );
		        }
		        return cb.conjunction();
		    };
	}
	 
	 private Specification<Project> withProgressRange(int min, int max) {
		 return (root, query, cb) -> cb.between(root.get("progress"), min, max);
	 }
	 
	 private Specification<Project> withPublicationFilters(String source, String doiIsbn) {
	        return (root, query, cb) -> {
	            if (isNullOrEmpty(source) && isNullOrEmpty(doiIsbn)) {
	                return cb.conjunction();
	            }
	            
	            List<UUID> matchingProjectIds = publicationService.findProjectsByFilters(source, doiIsbn);
	            
	            return getProjectIdSpecification(cb, root, matchingProjectIds);

	        };
	    }
	 
	 private Specification<Project> withResearchFilters(BigDecimal minBudget, BigDecimal maxBudget, String fundingSource) {
	        return (root, query, cb) -> {
	            if (minBudget == null && maxBudget == null && isNullOrEmpty(fundingSource)) {
	                return cb.conjunction();
	            }
	            
	            List<UUID> matchingProjectIds = researchService.findProjectsByFilters(minBudget, maxBudget, fundingSource);
	            
	            return getProjectIdSpecification(cb, root, matchingProjectIds);
	        };
	    }
	 
	 private Specification<Project> withPatentFilters(String registrationNumber, String issuingAuthority) {
	        return (root, query, cb) -> {
	            if (isNullOrEmpty(registrationNumber) && isNullOrEmpty(issuingAuthority)) {
	                return cb.conjunction();
	            }
	            
	            List<UUID> matchingProjectIds = patentService.findProjectsByFilters(registrationNumber, issuingAuthority);
	            
	            return getProjectIdSpecification(cb, root, matchingProjectIds);

	        };
	    }
	 
	 private Predicate getProjectIdSpecification(CriteriaBuilder cb, Root<Project> root, List<UUID> projectIds) {
		 return projectIds.isEmpty() ? cb.disjunction() : root.get("id").in(projectIds);
	 }
	 private boolean isNullOrEmpty(String value) {
		 return value == null || value.isEmpty();
	 }
}
