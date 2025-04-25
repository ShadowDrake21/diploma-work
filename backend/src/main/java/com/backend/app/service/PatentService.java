package com.backend.app.service;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.mapstruct.ap.shaded.freemarker.core.ReturnInstruction.Return;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.backend.app.dto.CreatePatentRequest;
import com.backend.app.model.Patent;
import com.backend.app.model.PatentCoInventor;
import com.backend.app.model.Project;
import com.backend.app.model.User;
import com.backend.app.repository.PatentRepository;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;

@Service
public class PatentService {
	@Autowired
	private PatentRepository patentRepository;
	
	@Autowired
	private ProjectRepository projectRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	public List<Patent> findAllPatents(){
		return patentRepository.findAll();
	}
	
	public Optional<Patent> findPatentById(UUID id) {
		return patentRepository.findByIdWithConInventors(id);
	}
	
	public List<Patent> findPatentByProjectId(UUID projectId) {
		return patentRepository.findByProjectId(projectId);
	}
	
	public Optional<Patent> updatePatent(UUID id, Patent newPatent) {
		return patentRepository.findById(id).map(existingPatent -> {
			existingPatent.setProject(newPatent.getProject());
			existingPatent.setPrimaryAuthor(newPatent.getPrimaryAuthor());
			existingPatent.setRegistrationNumber(newPatent.getRegistrationNumber());
			existingPatent.setRegistrationDate(newPatent.getRegistrationDate());
			existingPatent.setIssuingAuthority(newPatent.getIssuingAuthority());
			
			List<PatentCoInventor> existingCoInventors = existingPatent.getCoInventors();
			List<PatentCoInventor> newCoInventors = newPatent.getCoInventors();
			List<PatentCoInventor> coInventorsToRemove = existingCoInventors.stream().filter(existingCoInventor -> newCoInventors.stream().noneMatch(newCoInventor -> newCoInventor.getUser().getId().equals(existingCoInventor.getUser().getId()))).collect(Collectors.toList());
			
			coInventorsToRemove.forEach(existingPatent::removeCoInventor);
			
			
			for(PatentCoInventor newCoInventor : newCoInventors) {
				 boolean exists = existingCoInventors.stream()
			                .anyMatch(existingCoInventor -> existingCoInventor.getUser().getId().equals(newCoInventor.getUser().getId()));	
				 
				if(!exists) {
					newCoInventor.setPatent(existingPatent);
					existingPatent.addCoInventor(newCoInventor);
				}
			
			}
			
			return patentRepository.save(existingPatent);
		});
	}
	
	public Patent createPatent(CreatePatentRequest request) {
		Project project = projectRepository.findById(request.getProjectId()).orElseThrow(() -> new RuntimeException("Project not found with ID: " + request.getProjectId()));
		User user = userRepository.findById(request.getPrimaryAuthorId()).orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getPrimaryAuthorId()));;
		Patent patent = new Patent(
				project, user, request.getRegistrationNumber(), request.getRegistrationDate(), request.getIssuingAuthority());
		
		if(request.getCoInventors() != null && !request.getCoInventors().isEmpty()) {
			for(Long userId : request.getCoInventors()) {
				if(userId != null) {
					Optional<User> userOptional = userRepository.findById(userId);
					if(userOptional.isPresent()) {
						
						boolean exists = patent.getCoInventors().stream().anyMatch(ci -> ci.getUser().getId().equals(userId));
						
						if(!exists) {							
							PatentCoInventor coInventor = new PatentCoInventor();
							coInventor.setPatent(patent);
							coInventor.setUser(userOptional.get());
							patent.addCoInventor(coInventor);
						}
					}
				}
				
			}
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
	
	public void deletePatent(UUID id) {
		patentRepository.deleteById(id);
	}
}
