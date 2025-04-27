package com.backend.app.service;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

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

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

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
		return patentRepository.findById(id).map(existingPatent -> {
            updatePatentFields(existingPatent, newPatent);
            updateCoInventors(existingPatent, newPatent);
			return patentRepository.save(existingPatent);
		});
	}
	
	@Transactional
	public Patent createPatent(CreatePatentRequest request) {
		Project project = projectRepository.findById(request.getProjectId())
				.orElseThrow(() -> new RuntimeException
						("Project not found with ID: " + request.getProjectId()));
		User primaryAuthor = userRepository.findById(request.getPrimaryAuthorId())
				.orElseThrow(() -> new RuntimeException
						("Primary author not found with ID: " + request.getPrimaryAuthorId()));;
		Patent patent = Patent.builder().project(project)
				.primaryAuthor(primaryAuthor)
				.registrationNumber(request.getRegistrationNumber())
				.registrationDate(request.getRegistrationDate())
				.issuingAuthority(request.getIssuingAuthority())
				.build();
		addCoInventors(patent, request.getCoInventorIds());
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
		existing.setProject(newPatent.getProject());
		existing.setPrimaryAuthor(newPatent.getPrimaryAuthor());
		existing.setRegistrationNumber(newPatent.getRegistrationNumber());
		existing.setRegistrationDate(newPatent.getRegistrationDate());
		existing.setIssuingAuthority(newPatent.getIssuingAuthority());
	}
	
	private void updateCoInventors(Patent existingPatent, Patent newPatent) {
        List<PatentCoInventor> existingCoInventors = existingPatent.getCoInventors();
        List<PatentCoInventor> newCoInventors = newPatent.getCoInventors();

        existingCoInventors.stream()
                .filter(existingCoInventor -> newCoInventors.stream()
                        .noneMatch(newCoInventor -> newCoInventor.getUser().getId().equals(existingCoInventor.getUser().getId())))
                .collect(Collectors.toList())
                .forEach(existingPatent::removeCoInventor);

        newCoInventors.stream()
                .filter(newCoInventor -> existingCoInventors.stream()
                        .noneMatch(existingCoInventor -> existingCoInventor.getUser().getId().equals(newCoInventor.getUser().getId())))
                .forEach(newCoInventor -> {
                    newCoInventor.setPatent(existingPatent);
                    existingPatent.addCoInventor(newCoInventor);
                });
    }
	
	 private void addCoInventors(Patent patent, List<Long> coInventorIds) {
	        if (coInventorIds == null || coInventorIds.isEmpty()) {
	            return;
	        }

	        coInventorIds.stream()
	                .filter(Objects::nonNull)
	                .map(userRepository::findById)
	                .filter(Optional::isPresent)
	                .map(Optional::get)
	                .filter(user -> patent.getCoInventors().stream()
	                        .noneMatch(ci -> ci.getUser().getId().equals(user.getId())))
	                .forEach(user -> {
	                    PatentCoInventor coInventor = new PatentCoInventor();
	                    coInventor.setPatent(patent);
	                    coInventor.setUser(user);
	                    patent.addCoInventor(coInventor);
	                });
	    }
	
	public void deletePatent(UUID id) {
		patentRepository.deleteById(id);
	}
}
