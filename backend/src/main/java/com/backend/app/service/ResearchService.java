package com.backend.app.service;

import java.math.BigDecimal;
import java.util.Iterator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.backend.app.dto.CreateResearchRequest;
import com.backend.app.dto.ResearchDTO;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.mapper.ResearchMapper;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResearchService {
	private final ResearchRepository researchRepository;
	private final ProjectRepository projectRepository;
	private final UserRepository userRepository;
	private final ResearchMapper researchMapper;
	
	 @PersistenceContext
		private final EntityManager entityManager;
	
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
	public Research createResearch(CreateResearchRequest request) {
        log.info("Creating research for project ID: {}", request.getProjectId());

		Project project = projectRepository.findById(request.getProjectId()).orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + request.getProjectId()));
		Research research = Research.builder()
                .project(project)
                .budget(request.getBudget())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus())
                .fundingSource(request.getFundingSource())
                .build();
		
		addParticipantsToResearch(research, request.getParticipantIds());
		return researchRepository.save(research);
	}
	
	@Transactional 
	public ResearchDTO updateResearch(UUID id, ResearchDTO researchDTO) {
		 return researchRepository.findById(id).map(existingResearch -> {
			 	Research researchUpdate = researchMapper.toEntity(researchDTO);
	            updateResearchDetails(existingResearch, researchUpdate);
	            
	            updateResearchParticipantsByIds(existingResearch, researchDTO.getParticipantIds());
	            
	            Research updateResearch = researchRepository.save(existingResearch);
	            return researchMapper.toDTO(updateResearch);
	        }).orElseThrow(() -> new ResourceNotFoundException("Research not found with id: " + id));
	}
	
	public Research saveResearch(Research research) {
		return researchRepository.save(research);
	}
	
	@Transactional
	public void deleteResearch(UUID id) {
		if(!researchRepository.existsById(id)) {
			throw new ResourceNotFoundException("Research not found with ID: " + id);
		}
		researchRepository.deleteById(id);
	}
	
	public List<UUID> findProjectsByFilters(BigDecimal minBudget, BigDecimal maxBudget, String fundingSource) {
	    Specification<Research> spec = buildSearchSpecification(minBudget, maxBudget, fundingSource);
	    
	    return researchRepository.findAll(spec)
	        .stream()
	        .map(r -> r.getProject().getId())
	        .distinct()
	        .collect(Collectors.toList());
	}
	
	 private Specification<Research> buildSearchSpecification(BigDecimal minBudget, BigDecimal maxBudget, String fundingSource) {
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
		            cb.like(cb.lower(root.get("fundingSource")), 
		                "%" + fundingSource.toLowerCase() + "%"));
		    }
		    
		    return spec;
	    }
	
	private void addParticipantsToResearch(Research research, List<Long> participantIds) {
		Optional.ofNullable(participantIds).ifPresent(ids ->
		ids.stream().filter(Objects::nonNull).map(userRepository::findById).filter(Optional::isPresent).map(Optional::get).forEach(user -> research.addParticipant(new ResearchParticipant(research, user))));
	}
	
	private void updateResearchDetails(Research existing, Research update) {
		 existing.setProject(update.getProject());
	        existing.setBudget(update.getBudget());
	        existing.setStartDate(update.getStartDate());
	        existing.setEndDate(update.getEndDate());
	        existing.setStatus(update.getStatus());
	        existing.setFundingSource(update.getFundingSource());
	}
	
	private void updateResearchParticipants(Research research, List<ResearchParticipant> participants) {
		research.getResearchParticipants().clear();
		entityManager.flush();
		participants.forEach(participant -> {
            participant.setResearch(research);
            research.addParticipant(participant);
        });
		}
	
	private void updateResearchParticipantsByIds(Research research, List<Long> participantIds) {
		research.getResearchParticipants().clear();
		
		if(participantIds != null) {
			participantIds.forEach(id -> {
				User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
				
				research.addParticipant(new ResearchParticipant(research, user));
			});
		}
		
		entityManager.flush();
	}
}
