package com.backend.app.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.ResearchDTO;
import com.backend.app.mapper.ResearchMapper;
import com.backend.app.model.Research;
import com.backend.app.service.ResearchService;

@RestController
@RequestMapping("/api/researches")
public class ResearchController {
	@Autowired
	private ResearchService researchService;
	
	@Autowired
	private ResearchMapper researchMapper;
	
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
	public ResearchDTO createResearch(@RequestBody Research research) {
		return researchMapper.toDTO(researchService.saveResearch(research));
	}
	
	@PutMapping("/{id}")
	public ResearchDTO updateResearch(@PathVariable UUID id, @RequestBody Research research) {
		Optional<Research> researchOptional = researchService.updateResearch(id, research);
		return researchOptional.map(researchMapper::toDTO).orElseThrow(() -> new RuntimeException("Research not found with id: " + id));
	}
	
	@DeleteMapping("/{id}")
	public void deleteResearch(@PathVariable UUID id) {
		researchService.deleteResearch(id);
	}
}
