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

import com.backend.app.model.Research;
import com.backend.app.service.ResearchService;

@RestController
@RequestMapping("/api/research")
public class ResearchController {
	@Autowired
	private ResearchService researchService;
	
	@GetMapping
	public List<Research> getAllResearches(){
		return researchService.findAllResearches();
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Optional<Research>> getResearchById(@PathVariable UUID id) {
		return ResponseEntity.ok(researchService.findResearchById(id));
	}
	
	@PostMapping
	public Research createResearch(@RequestBody Research research) {
		return researchService.saveResearch(research);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<Optional<Research>> updateResearch(@PathVariable UUID id, @RequestBody Research research) {
		return ResponseEntity.ok(researchService.updateResearch(id, research));
	}
	
	@DeleteMapping("/{id}")
	public void deleteResearch(@PathVariable UUID id) {
		researchService.deleteResearch(id);
	}
}
