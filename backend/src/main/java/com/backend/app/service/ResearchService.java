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
	
	public Research saveResearch(Research research) {
		return researchRepository.save(research);
	}
	
	public void deleteResearch(UUID id) {
		researchRepository.deleteById(id);
	}
}
