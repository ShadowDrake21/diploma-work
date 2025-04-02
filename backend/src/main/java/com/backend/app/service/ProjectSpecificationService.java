package com.backend.app.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.backend.app.dto.ProjectSearchCriteria;
import com.backend.app.enums.ProjectType;
import com.backend.app.model.Project;
import com.backend.app.model.Tag;
import com.backend.app.repository.TagRepository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;

@Service
public class ProjectSpecificationService {
	public Specification<Project> buildSpecification(ProjectSearchCriteria criteria) {
		return Specification.where(withSearchQuery(criteria.getSearch()))
				.and(withTypes(criteria.getTypes()))
				.and(withTags(criteria.getTags()))
				.and(withDateRange(criteria.getStartDate(), criteria.getEndDate()))
                .and(withStatus(criteria.getStatus()))
                .and(withProgressRange(criteria.getProgressMin(), criteria.getProgressMax()))
                .and(withPublicationFilters(criteria.getPublicationSource(), criteria.getDoiIsbn()))
                .and(withResearchFilters(criteria.getMinBudget(), criteria.getMaxBudget(), criteria.getFundingSource()))
                .and(withPatentFilters(criteria.getRegistrationNumber(), criteria.getIssuingAuthority()));
	}
	
	private Specification<Project> withSearchQuery(String search) {
		return (root, query, cb) -> {
			if(search == null || search.isEmpty()) {
				return cb.conjunction();
			}
			String searchPattern = "%" + search.toLowerCase() + "%";
			return cb.or(cb.like(cb.lower(root.get("title")), searchPattern), cb.like(cb.lower(root.get("description")), searchPattern));};
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
			if(startDate == null && endDate == null) {
				return cb.conjunction();
			}
			
			List<Predicate> predicates = new ArrayList<>();
			
			if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate.atStartOfDay()));
            }
			
			if(endDate != null) {
				predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate.atTime(23, 59, 59)));
			}
			
			return cb.and(predicates.toArray(new Predicate[0]));
		};
	}
	
	 private Specification<Project> withStatus(List<String> statuses) {
	        return (root, query, cb) -> {
	            if (statuses == null || statuses.isEmpty()) {
	                return cb.conjunction();
	            }
	            
	            List<Predicate> statusPredicates = new ArrayList<>();
	            
	            if (statuses.contains("assigned")) {
	                statusPredicates.add(cb.greaterThan(root.get("progress"), 0));
	            }
	            if (statuses.contains("in_progress")) {
	                statusPredicates.add(cb.between(root.get("progress"), 1, 99));
	            }
	            if (statuses.contains("completed")) {
	                statusPredicates.add(cb.equal(root.get("progress"), 100));
	            }
	            
	            return statusPredicates.isEmpty() ? 
	                   cb.conjunction() : 
	                   cb.or(statusPredicates.toArray(new Predicate[0]));
	        };
	    }
	 
	 private Specification<Project> withProgressRange(int min, int max) {
		 return (root, query, cb) -> cb.between(root.get("progress"), min, max);
	 }
	 
	 private Specification<Project> withPublicationFilters(String source, String doiIsbn) {
	        return (root, query, cb) -> {
	            if ((source == null || source.isEmpty()) && (doiIsbn == null || doiIsbn.isEmpty())) {
	                return cb.conjunction();
	            }
	            
	            List<Predicate> predicates = new ArrayList<>();
	            
	            if (source != null && !source.isEmpty()) {
	                String sourcePattern = "%" + source.toLowerCase() + "%";
	                predicates.add(cb.like(cb.lower(root.get("publication").get("source")), sourcePattern));
	            }
	            if (doiIsbn != null && !doiIsbn.isEmpty()) {
	                String doiIsbnPattern = "%" + doiIsbn.toLowerCase() + "%";
	                predicates.add(cb.like(cb.lower(root.get("publication").get("doiIsbn")), doiIsbnPattern));
	            }
	            
	            return cb.and(predicates.toArray(new Predicate[0]));
	        };
	    }
	 
	 private Specification<Project> withResearchFilters(BigDecimal minBudget, BigDecimal maxBudget, String fundingSource) {
	        return (root, query, cb) -> {
	            if (minBudget == null && maxBudget == null && (fundingSource == null || fundingSource.isEmpty())) {
	                return cb.conjunction();
	            }
	            
	            List<Predicate> predicates = new ArrayList<>();
	            
	            if (minBudget != null) {
	                predicates.add(cb.greaterThanOrEqualTo(root.get("research").get("budget"), minBudget));
	            }
	            if (maxBudget != null) {
	                predicates.add(cb.lessThanOrEqualTo(root.get("research").get("budget"), maxBudget));
	            }
	            if (fundingSource != null && !fundingSource.isEmpty()) {
	                String fundingPattern = "%" + fundingSource.toLowerCase() + "%";
	                predicates.add(cb.like(cb.lower(root.get("research").get("fundingSource")), fundingPattern));
	            }
	            
	            return cb.and(predicates.toArray(new Predicate[0]));
	        };
	    }
	 
	 private Specification<Project> withPatentFilters(String registrationNumber, String issuingAuthority) {
	        return (root, query, cb) -> {
	            if ((registrationNumber == null || registrationNumber.isEmpty()) && 
	                (issuingAuthority == null || issuingAuthority.isEmpty())) {
	                return cb.conjunction();
	            }
	            
	            List<Predicate> predicates = new ArrayList<>();
	            
	            if (registrationNumber != null && !registrationNumber.isEmpty()) {
	                String regNumPattern = "%" + registrationNumber.toLowerCase() + "%";
	                predicates.add(cb.like(cb.lower(root.get("patent").get("registrationNumber")), regNumPattern));
	            }
	            if (issuingAuthority != null && !issuingAuthority.isEmpty()) {
	                String authorityPattern = "%" + issuingAuthority.toLowerCase() + "%";
	                predicates.add(cb.like(cb.lower(root.get("patent").get("issuingAuthority")), authorityPattern));
	            }
	            
	            return cb.and(predicates.toArray(new Predicate[0]));
	        };
	    }
}
