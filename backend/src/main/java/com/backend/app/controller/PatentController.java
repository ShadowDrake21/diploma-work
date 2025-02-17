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

import com.backend.app.model.Patent;
import com.backend.app.service.PatentService;

@RestController
@RequestMapping("/api/patents")
public class PatentController {
	@Autowired
	private PatentService patentService;
	
	@GetMapping
	public List<Patent> getAllPatents(){
		return patentService.findAllPatents();
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Optional<Patent>> getPatentById(@PathVariable UUID id) {
		return ResponseEntity.ok(patentService.findPatentById(id));
	}
	
	@PostMapping
	public Patent createPatent(@RequestBody Patent patent) {
		return patentService.savePatent(patent);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<Optional<Patent>> updatePatent(@PathVariable UUID id, @RequestBody Patent patent) {
		return ResponseEntity.ok(patentService.updatePatent(id, patent));
	}
	
	@DeleteMapping("/{id}")
	public void deletePatent(@PathVariable UUID id) {
		patentService.deletePatent(id);
	}
}
