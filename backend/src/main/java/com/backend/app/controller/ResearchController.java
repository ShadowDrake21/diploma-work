package com.backend.app.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.CreateResearchRequest;
import com.backend.app.dto.ResearchDTO;
import com.backend.app.mapper.ResearchMapper;
import com.backend.app.model.Research;
import com.backend.app.service.ResearchService;

@RestController
@RequestMapping("/api/researches")
public class ResearchController {
	private ResearchService researchService;
	private ResearchMapper researchMapper;
	
	public ResearchController(ResearchService researchService, ResearchMapper researchMapper) {
		super();
		this.researchService = researchService;
		this.researchMapper = researchMapper;
	}

	@GetMapping
	public List<ResearchDTO> getAllResearches(){
		return researchService.findAllResearches().stream().map(researchMapper::toDTO).collect(Collectors.toList());
	}
	
	@GetMapping("/{id}")
	public ResearchDTO getResearchById(@PathVariable UUID id) {
		Optional<Research> researchOptional = researchService.findResearchById(id);
		return researchOptional.map(researchMapper::toDTO)
	            .orElseThrow(() -> new RuntimeException("Research not found with id: " + id));
	}
	
	@PostMapping
	public ResearchDTO createResearch(@RequestBody CreateResearchRequest request) {
		Research research = researchService.createResearch(request);
		return researchMapper.toDTO(researchService.saveResearch(research));
	}
	
	@PutMapping("/{id}")
	public ResearchDTO updateResearch(@PathVariable UUID id, @RequestBody ResearchDTO researchDTO) {
		Research research = researchMapper.toEntity(researchDTO);
		Optional<Research> updatedResearch = researchService.updateResearch(id, research);
		return updatedResearch.map(researchMapper::toDTO).orElseThrow(() -> new RuntimeException("Research not found with id: " + id));
	}
	
	@DeleteMapping("/{id}")
	public void deleteResearch(@PathVariable UUID id) {
		researchService.deleteResearch(id);
	}
}
