package com.backend.app.service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.mapstruct.ap.shaded.freemarker.core.ReturnInstruction.Return;
import org.springframework.beans.factory.annotation.Autowired;
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
		return patentRepository.findById(id);
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
			
			return patentRepository.save(existingPatent);
		});
	}
	
	public Patent createPatent(CreatePatentRequest request) {
		System.out.println("patent: " + request.getProjectId() + " primary: " + request.getPrimaryAuthorId() + " and coinventors: " + request.getCoInventors().getFirst());
		Project project = projectRepository.findById(request.getProjectId()).orElseThrow(() -> new RuntimeException("Project not found with ID: " + request.getProjectId()));
		User user = userRepository.findById(request.getPrimaryAuthorId()).orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getPrimaryAuthorId()));;
		Patent patent = new Patent(
				project, user, request.getRegistrationNumber(), request.getRegistrationDate(), request.getIssuingAuthority());
		
		if(request.getCoInventors() != null && !request.getCoInventors().isEmpty()) {
			for(Long userId : request.getCoInventors()) {
				if(userId != null) {
					Optional<User> userOptional = userRepository.findById(userId);
					if(userOptional.isPresent()) {
						PatentCoInventor coInventor = new PatentCoInventor();
						coInventor.setPatent(patent);
						coInventor.setUser(userOptional.get());
						patent.addCoInventor(coInventor);
					}
				}
				
			}
		}
		return patentRepository.save(patent);
	}
	
	public Patent savePatent(Patent patent) {
		return patentRepository.save(patent);
	}
	
	public void deletePatent(UUID id) {
		patentRepository.deleteById(id);
	}
}
