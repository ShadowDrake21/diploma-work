package com.backend.app.controller;

import java.util.List;
import java.util.UUID;

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

import com.backend.app.dto.CreatePublicationRequest;
import com.backend.app.dto.PublicationDTO;
import com.backend.app.mapper.PublicationMapper;
import com.backend.app.model.Publication;
import com.backend.app.service.PublicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Publication Management", description = "Endpoints for managin publications")
@RestController
@RequestMapping("/api/publications")
@RequiredArgsConstructor
public class PublicationController {
	private final PublicationService publicationService;
	private final PublicationMapper publicationMapper;
	
	@Operation(summary = "Get all publications")
	@GetMapping
	public ResponseEntity<List<PublicationDTO>> getAllPublications(){
		List<PublicationDTO> publications = publicationService.findAllPublications().stream().map(publicationMapper::toDTO).toList();
		return ResponseEntity.ok(publications);
	}
	
	@Operation(summary = "Get publication by ID")
	@GetMapping("/{id}")
	public ResponseEntity<PublicationDTO> getPublicationById(@Parameter(description = "ID of the publication to retrieve")  @PathVariable UUID id) {
		PublicationDTO publication = publicationService.findPublicationById(id);
		return ResponseEntity.ok(publication);
	}
	
	@Operation(summary = "Create a new publication")
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ResponseEntity<PublicationDTO> createPublication(@Valid @RequestBody CreatePublicationRequest request) {
		Publication publication = publicationService.createPublication(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(publicationMapper.toDTO(publication));
	}
	
	@Operation(summary = "Update as existing publication")
	@PutMapping("/{id}")
	public ResponseEntity<PublicationDTO> updatePublication(@Parameter(description = "ID of the publication to update") @PathVariable UUID id, @Valid @RequestBody PublicationDTO publicationDTO) {
		
		PublicationDTO updatedPublication = publicationService.updatePublication(id, publicationDTO);
		return ResponseEntity.ok(updatedPublication);
	}
	
	@Operation(summary = "Delete a publication")
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deletePublication( @Parameter(description = "ID of the publication to delete") @PathVariable UUID id) {
		publicationService.deleteProject(id);
	}
}
