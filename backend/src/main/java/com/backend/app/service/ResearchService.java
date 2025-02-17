package com.backend.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.app.model.Research;
import com.backend.app.repository.ResearchRepository;

@Service
public class ResearchService {
	@Autowired
	private ResearchRepository researchRepository;
	
	public List<Research> findAllResearches(){
		return researchRepository.findAll();
	}
	
	public Optional<Research> findResearchById(UUID id) {
		return researchRepository.findById(id);
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
	
	public Research saveResearch(Research research) {
		return researchRepository.save(research);
	}
	
	public void deleteResearch(UUID id) {
		researchRepository.deleteById(id);
	}
}
