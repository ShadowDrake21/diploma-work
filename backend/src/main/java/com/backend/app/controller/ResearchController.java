package com.backend.app.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.create.CreateResearchRequest;
import com.backend.app.dto.model.ResearchDTO;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.mapper.ResearchMapper;
import com.backend.app.model.Research;
import com.backend.app.service.ResearchService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Tag(name = "Research Management", description = "Endpoints for managing research projects")
@RestController
@RequestMapping("/api/researches")
@RequiredArgsConstructor
public class ResearchController {
	private final ResearchService researchService;
	private final ResearchMapper researchMapper;

	@Operation(summary = "Get all research projects")
	@GetMapping
	public ResponseEntity<List<ResearchDTO>> getAllResearches(){
		log.info("Fetching all research projects");
		List<ResearchDTO> researches = researchService.findAllResearches().stream().map(researchMapper::toDTO).toList();
		log.debug("Found {} research projects", researches.size());
		return ResponseEntity.ok(researches);
	}
	
	@Operation(summary = "Get research project by ID")
	@GetMapping("/{id}")
	public ResponseEntity<ResearchDTO> getResearchById(@Parameter(description = "ID of the research project") @PathVariable UUID id) {
		log.info("Fetching research project with ID: {}", id);
		ResearchDTO research =  researchService.findResearchById(id).map(researchMapper::toDTO)
	            .orElseThrow(() -> new ResourceNotFoundException("Research not found with id: " + id));
		log.debug("Found research project: {}", research);
		return ResponseEntity.ok(research);
	}
	
	@Operation(summary = "Create a new research project")
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ResponseEntity<ResearchDTO> createResearch(@Valid @RequestBody CreateResearchRequest request) {
		log.info("Creating new research project with request: {}", request);
		Research createdResearch = researchService.createResearch(request);
		 log.debug("Created research project with ID: {}", createdResearch.getId());
		return ResponseEntity.status(HttpStatus.CREATED).body(researchMapper.toDTO(createdResearch));
	}
	
	@Operation(summary = "Update an existing research project")
	@PutMapping("/{id}")
	public ResponseEntity<ResearchDTO> updateResearch(@Parameter(description = "ID of the research project to update") @PathVariable UUID id, @Valid @RequestBody ResearchDTO researchDTO) {
		log.info("Updating research project with ID: {}, data: {}", id, researchDTO);
		ResearchDTO updatedResearch = researchService.updateResearch(id, researchDTO);
		log.debug("Updated research project: {}", updatedResearch);
		return ResponseEntity.ok(updatedResearch);
	}
	
	@Operation(summary = "Delete a research project")
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteResearch(@Parameter(description = "ID of the research project to delete") @PathVariable UUID id) {
		 log.info("Deleting research project with ID: {}", id);
		researchService.deleteResearch(id);
		log.debug("Deleted research project with ID: {}", id);
	}
}
