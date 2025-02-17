package com.backend.app.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

import com.backend.app.model.Publication;
import com.backend.app.service.PublicationService;

@RestController
@RequestMapping("/api/publications")
public class PublicationController {
	@Autowired
	private PublicationService publicationService;
	
	@GetMapping
	public List<Publication> getAllPublications(){
		return publicationService.findAllPublications();
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Optional<Publication>> getPublicationById(@PathVariable UUID id) {
		return ResponseEntity.ok(publicationService.findPublicationById(id));
	}
	
	@PostMapping
	public Publication createPublication(@RequestBody Publication publication) {
		return publicationService.savePublication(publication);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<Optional<Publication>> updatePublication(@PathVariable UUID id, @RequestBody Publication publication) {
		return ResponseEntity.ok(publicationService.updatePublication(id, publication));
	}
	
	@DeleteMapping("/{id}")
	public void deletePublication(@PathVariable UUID id) {
		publicationService.deleteProject(id);
	}
}
