package com.backend.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.app.dto.CreateResearchRequest;
import com.backend.app.model.Project;
import com.backend.app.model.Research;
import com.backend.app.model.ResearchParticipant;
import com.backend.app.model.User;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.ResearchRepository;
import com.backend.app.repository.UserRepository;

@Service
public class ResearchService {
	@Autowired
	private ResearchRepository researchRepository;
	
	@Autowired
	private ProjectRepository projectRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	public List<Research> findAllResearches(){
		return researchRepository.findAll();
	}
	
	public Optional<Research> findResearchById(UUID id) {
		return researchRepository.findById(id);
	}
	
	public List<Research> findResearchByProjectId(UUID projectId) {
		return researchRepository.findByProjectId(projectId);
	}
	
	public Optional<Research> updateResearch(UUID id, Research newResearch) {
		return researchRepository.findById(id).map(existingResearch -> {
			existingResearch.setProject(newResearch.getProject());
			existingResearch.setBudget(newResearch.getBudget());
			existingResearch.setStartDate(newResearch.getStartDate());
			existingResearch.setEndDate(newResearch.getEndDate());
			existingResearch.setStatus(newResearch.getStatus());
			existingResearch.setFundingSource(newResearch.getFundingSource());
			
			return researchRepository.save(existingResearch);
		});
	}
	
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
}
