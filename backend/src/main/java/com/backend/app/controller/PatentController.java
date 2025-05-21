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
import org.springframework.web.server.ResponseStatusException;

import com.backend.app.dto.create.CreatePatentRequest;
import com.backend.app.dto.model.PatentDTO;
import com.backend.app.mapper.PatentMapper;
import com.backend.app.model.Patent;
import com.backend.app.service.PatentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for managing patents
 */
@Slf4j
@RestController
@RequestMapping("/api/patents")
@RequiredArgsConstructor
public class PatentController {
	private final PatentService patentService;
    private final PatentMapper patentMapper;
	
    /**
     * Get all patents
     * @return List of PatentDTO
     */
	@GetMapping
	public ResponseEntity<List<PatentDTO>> getAllPatents(){
		log.info("Fetching all patents");
		List<PatentDTO> patents = patentService.findAllPatents().stream().map(patentMapper::toDTO).collect(Collectors.toList());
		return ResponseEntity.ok(patents);
	}
	
	
	/**
     * Get a patent by ID
     * @param id Patent ID
     * @return PatentDTO
     */
	@GetMapping("/{id}")
	public ResponseEntity<PatentDTO> getPatentById(@PathVariable UUID id) {
        log.info("Fetching patent with id: {}", id);
		return patentService.findPatentById(id)
				.map(patentMapper::toDTO)
				.map(ResponseEntity::ok)
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.NOT_FOUND,
						"Patent not found with id: " + id));
	}
	
	 /**
     * Create a new patent
     * @param request CreatePatentRequest
     * @return Created PatentDTO
     */
	@PostMapping
	public ResponseEntity<PatentDTO> createPatent(@Valid @RequestBody CreatePatentRequest request) {
		log.info("Creating new patent for project: {}", request.getProjectId());
		Patent patent = patentService.createPatent(request);
		PatentDTO result = patentMapper.toDTO(patent);
 		return ResponseEntity.status(HttpStatus.CREATED).body(result);
	}
	
	/**
     * Update an existing patent
     * @param id Patent ID
     * @param patentDTO PatentDTO with updates
     * @return Updated PatentDTO
     */
	@PutMapping("/{id}")
	public ResponseEntity<PatentDTO> updatePatent(@PathVariable UUID id, @Valid @RequestBody PatentDTO patentDTO) {
		log.info("Updating patent with id: {}", id);
		
		if(!id.equals(patentDTO.getId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID in path does not match ID in body");
		}
		
		Patent existing = patentService.findPatentById(id).orElseThrow(() -> new ResponseStatusException(
	            HttpStatus.NOT_FOUND,
	            "Patent not found with id: " + id));
		
		if(!existing.getProject().getId().equals(patentDTO.getProjectId())) {
			throw new ResponseStatusException(
					 HttpStatus.BAD_REQUEST, 
			            "Changing project association is not allowed through this endpoint"
					);
			
		}
 		
		Patent patent = patentMapper.toEntity(patentDTO);
        return patentService.updatePatent(id, patent)
                .map(patentMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Patent not found with id: " + id
                ));
		
	}
	
	/**
     * Delete a patent
     * @param id Patent ID
     * @return No content response
     */
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deletePatent(@PathVariable UUID id) {
		log.info("Deleting patent with id: {}", id);
		patentService.deletePatent(id);
	}
}
