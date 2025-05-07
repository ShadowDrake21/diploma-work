package com.backend.app.service;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.backend.app.dto.CreatePatentRequest;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.model.Patent;
import com.backend.app.model.PatentCoInventor;
import com.backend.app.model.Project;
import com.backend.app.model.User;
import com.backend.app.repository.PatentRepository;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PatentService {
	private final PatentRepository patentRepository;
	private final ProjectRepository projectRepository;
	private final UserRepository userRepository;
	
	public List<Patent> findAllPatents(){
		return patentRepository.findAll();
	}
	
	public Optional<Patent> findPatentById(UUID id) {
		return patentRepository.findByIdWithConInventors(id);
	}
	
	public List<Patent> findPatentByProjectId(UUID projectId) {
		return patentRepository.findByProjectId(projectId);
	}
	
	@Transactional
    public Optional<Patent> updatePatent(UUID id, Patent newPatent) {
        return patentRepository.findByIdWithConInventors(id).map(existing -> {
            
        if(!existing.getProject().getId().equals(newPatent.getProject().getId())) {
        	throw new IllegalStateException("Changing project association is not allowed through this endpoint");
        }
        
        updatePatentFields(existing, newPatent);
        
        updateCoInventors(existing, newPatent);
            
            // Save and return the updated patent
            return patentRepository.save(existing);
        });
    }
	
	 private void clearExistingCoInventors(Patent patent) {
		 log.debug("Clearing {} existing co-inventors for patent {}", 
			        patent.getCoInventors().size(), patent.getId());
	        // Create a new list to avoid ConcurrentModificationException
	        List<PatentCoInventor> coInventorsToRemove = new ArrayList<>(patent.getCoInventors());
	        coInventorsToRemove.forEach(patent::removeCoInventor);
	        
	        // Explicitly flush to ensure deletions are processed
	        patentRepository.flush();
	    }

	    private void addNewCoInventors(Patent patent, List<PatentCoInventor> newCoInventors) {
	    	log.debug("Adding {} new co-inventors to patent {}", 
	    	        newCoInventors.size(), patent.getId());
	        if (newCoInventors == null || newCoInventors.isEmpty()) {
	            return;
	        }

	        for (PatentCoInventor newCoInventor : newCoInventors) {
	            // Verify user exists
	            Long userId = newCoInventor.getUser().getId();
	            User user = userRepository.findById(userId)
	                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
	            
	            // Create new relationship
	            PatentCoInventor coInventor = new PatentCoInventor();
	            coInventor.setPatent(patent);
	            coInventor.setUser(user);
	            patent.addCoInventor(coInventor);
	        }
	    }
	
	@Transactional
	public Patent createPatent(CreatePatentRequest request) {
		Project project = projectRepository.findById(request.getProjectId())
				.orElseThrow(() -> new ResourceNotFoundException
						("Project not found with ID: " + request.getProjectId()));
		User primaryAuthor = userRepository.findById(request.getPrimaryAuthorId())
				.orElseThrow(() -> new ResourceNotFoundException
						("Primary author not found with ID: " + request.getPrimaryAuthorId()));;
		Patent patent = Patent.builder().project(project)
				.primaryAuthor(primaryAuthor)
				.registrationNumber(request.getRegistrationNumber())
				.registrationDate(request.getRegistrationDate())
				.issuingAuthority(request.getIssuingAuthority())
				.coInventors(new ArrayList<PatentCoInventor>())
				.build();
		
		
		
		if(request.getCoInventorIds() != null) {
			
			request.getCoInventorIds().forEach(coInventorId -> {
				User coInventor = userRepository.findById(coInventorId)   .orElseThrow(() -> new ResourceNotFoundException("Co-inventor not found with ID: " + coInventorId));
				
				PatentCoInventor patentCoInventor = new PatentCoInventor();
				patentCoInventor.setPatent(patent);
				patentCoInventor.setUser(coInventor);
				patent.addCoInventor(patentCoInventor);
			});
		}
		
		return patentRepository.save(patent);
	}
	
	public List<UUID> findProjectsByFilters(String registrationNumber, String issuingAuthority) {
	    Specification<Patent> spec = Specification.where(null);
	    
	    if (registrationNumber != null && !registrationNumber.isEmpty()) {
	        spec = spec.and((root, query, cb) -> 
	            cb.like(cb.lower(root.get("registrationNumber")), "%" + registrationNumber.toLowerCase() + "%"));
	    }
	    
	    if (issuingAuthority != null && !issuingAuthority.isEmpty()) {
	        spec = spec.and((root, query, cb) -> 
	            cb.like(cb.lower(root.get("issuingAuthority")), "%" + issuingAuthority.toLowerCase() + "%"));
	    }
	    
	    return patentRepository.findAll(spec)
	        .stream()
	        .map(p -> p.getProject().getId())
	        .distinct()
	        .collect(Collectors.toList());
	}
	
	public Patent savePatent(Patent patent) {
		return patentRepository.save(patent);
	}
	
	public void updatePatentFields(Patent existing, Patent newPatent) {
		   if (newPatent.getPrimaryAuthor() != null) {
	            existing.setPrimaryAuthor(newPatent.getPrimaryAuthor());
	        }
	        if (newPatent.getRegistrationNumber() != null) {
	            existing.setRegistrationNumber(newPatent.getRegistrationNumber());
	        }
	        if (newPatent.getRegistrationDate() != null) {
	            existing.setRegistrationDate(newPatent.getRegistrationDate());
	        }
	        if (newPatent.getIssuingAuthority() != null) {
	            existing.setIssuingAuthority(newPatent.getIssuingAuthority());
	        }
	}
	
	private void updateCoInventors(Patent existingPatent, Patent newPatent) {
		if (newPatent.getCoInventors() == null) {
			
			return;
		}
	    log.debug("Starting co-inventor update for patent {}", existingPatent.getId());

		
       Set<Long> newCoInventorIds = newPatent.getCoInventors().stream().map(coInventor -> coInventor.getUser().getId()).collect(Collectors.toSet());
       
       log.debug("New co-inventor IDs: {}", newCoInventorIds);

       
       List<PatentCoInventor> toRemove = existingPatent.getCoInventors().stream().filter(ci -> !newCoInventorIds.contains(ci.getUser().getId())).collect(Collectors.toList());
       log.debug("Removing {} co-inventors", toRemove.size());

       toRemove.forEach(existingPatent::removeCoInventor);
       
       newPatent.getCoInventors().forEach(newCoInventor -> {
    	   Long userId = newCoInventor.getUser().getId();
    	   if (!userRepository.existsById(userId)) {
    	        throw new ResourceNotFoundException("User not found with ID: " + userId);
    	    }
    	   
    	   boolean exists = existingPatent.getCoInventors().stream().anyMatch(ci -> ci.getUser().getId().equals(userId));
    	   
    	   if(!exists) {
               log.debug("Adding new co-inventor with ID: {}", userId);

    		   PatentCoInventor coInventor = new PatentCoInventor();
    		   coInventor.setPatent(existingPatent);
    		   coInventor.setUser(newCoInventor.getUser());
    		   existingPatent.addCoInventor(coInventor);
    	   }
       });
       log.debug("Completed co-inventor update. Final count: {}", existingPatent.getCoInventors().size());

    }
	
	 private void addCoInventors(Patent patent, List<Long> coInventorIds) {
	        if (coInventorIds == null || coInventorIds.isEmpty()) {
	            return;
	        }

	      for(Long coInventorId: coInventorIds) {
	    	  User user = userRepository.findById(coInventorId) .orElseThrow(() -> new RuntimeException("User not found with ID: " + coInventorId));
	    	  
	    	  PatentCoInventor coInventor = new PatentCoInventor();
	    	  coInventor.setPatent(patent);
	    	  coInventor.setUser(user);
	    	  
	    	  patent.addCoInventor(coInventor);
	      }
	    }
	
	public void deletePatent(UUID id) {
		patentRepository.deleteById(id);
	}
}
