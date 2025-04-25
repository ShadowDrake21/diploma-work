package com.backend.app.service;

import java.math.BigDecimal;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.backend.app.dto.CreateResearchRequest;
import com.backend.app.model.Project;
import com.backend.app.model.Research;
import com.backend.app.model.ResearchParticipant;
import com.backend.app.model.User;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.ResearchRepository;
import com.backend.app.repository.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@Service
public class ResearchService {
	@Autowired
	private ResearchRepository researchRepository;
	
	@Autowired
	private ProjectRepository projectRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	 @PersistenceContext
		private EntityManager entityManager;
	
	public List<Research> findAllResearches(){
		return researchRepository.findAll();
	}
	
	public Optional<Research> findResearchById(UUID id) {
		return researchRepository.findById(id);
	}
	
	public List<Research> findResearchByProjectId(UUID projectId) {
		return researchRepository.findByProjectId(projectId);
	}
	
	@Transactional 
	public Optional<Research> updateResearch(UUID id, Research newResearch) {
		return researchRepository.findById(id).map(existingResearch -> {
			existingResearch.setProject(newResearch.getProject());
			existingResearch.setBudget(newResearch.getBudget());
			existingResearch.setStartDate(newResearch.getStartDate());
			existingResearch.setEndDate(newResearch.getEndDate());
			existingResearch.setStatus(newResearch.getStatus());
			existingResearch.setFundingSource(newResearch.getFundingSource());
			
			existingResearch.getResearchParticipants().clear();
			entityManager.flush();
			for(ResearchParticipant participant : newResearch.getResearchParticipants()) {
				participant.setResearch(existingResearch);
				existingResearch.addParticipant(participant);
			}
			
			return researchRepository.save(existingResearch);
		});
	}
	
	@Transactional 
	public Research createResearch(CreateResearchRequest request) {
		System.out.println("patent: " + request.getProjectId() + " primary: " + request.getParticipants());

		Project project = projectRepository.findById(request.getProjectId()).orElseThrow(() -> new RuntimeException("Project not found with ID: " + request.getProjectId()));
		Research research = new Research(project, request.getBudget(), request.getStartDate(), request.getEndDate(), request.getStatus(), request.getFundingSource());
		
		if(request.getParticipants() != null && !request.getParticipants().isEmpty()) {
			for(Long userId : request.getParticipants()) {
				if(userId != null) {
					Optional<User> userOptional = userRepository.findById(userId);
					if(userOptional.isPresent()) {
						ResearchParticipant participant = new ResearchParticipant();
						participant.setResearch(research);
						participant.setUser(userOptional.get());
						research.addParticipant(participant);
					}
				}
			}
		}
		return researchRepository.save(research);
	}
	
	public Research saveResearch(Research research) {
		return researchRepository.save(research);
	}
	
	public void deleteResearch(UUID id) {
		researchRepository.deleteById(id);
	}
	
	public List<UUID> findProjectsByFilters(BigDecimal minBudget, BigDecimal maxBudget, String fundingSource) {
	    Specification<Research> spec = Specification.where(null);
	    
	    if (minBudget != null) {
	        spec = spec.and((root, query, cb) -> 
	            cb.greaterThanOrEqualTo(root.get("budget"), minBudget));
	    }
	    
	    if (maxBudget != null) {
	        spec = spec.and((root, query, cb) -> 
	            cb.lessThanOrEqualTo(root.get("budget"), maxBudget));
	    }
	    
	    if (fundingSource != null && !fundingSource.isEmpty()) {
	        spec = spec.and((root, query, cb) -> 
	            cb.like(cb.lower(root.get("fundingSource")), "%" + fundingSource.toLowerCase() + "%"));
	    }
	    
	    return researchRepository.findAll(spec)
	        .stream()
	        .map(r -> r.getProject().getId())
	        .distinct()
	        .collect(Collectors.toList());
	}
}
