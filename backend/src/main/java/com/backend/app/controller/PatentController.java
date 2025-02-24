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

import com.backend.app.dto.CreatePatentRequest;
import com.backend.app.dto.PatentDTO;
import com.backend.app.mapper.PatentMapper;
import com.backend.app.model.Patent;
import com.backend.app.service.PatentService;

@RestController
@RequestMapping("/api/patents")
public class PatentController {
	private PatentService patentService;
    private PatentMapper patentMapper;
    
    public PatentController(PatentService patentService, PatentMapper patentMapper) {
        this.patentService = patentService;
        this.patentMapper = patentMapper;
    }
	
	@GetMapping
	public List<PatentDTO> getAllPatents(){
		return patentService.findAllPatents().stream().map(patentMapper::toDTO).collect(Collectors.toList());
	}
	
	@GetMapping("/{id}")
	public PatentDTO getPatentById(@PathVariable UUID id) {
		Optional<Patent> patentOptional = patentService.findPatentById(id);
		return patentOptional.map(patentMapper::toDTO)
	            .orElseThrow(() -> new RuntimeException("Patent not found with id: " + id));
	}
	
	@PostMapping
	public PatentDTO createPatent(@RequestBody CreatePatentRequest request) {
		Patent patent = patentService.createPatent(request);
 		return patentMapper.toDTO(patentService.savePatent(patent));
	}
	
	@PutMapping("/{id}")
	public PatentDTO updatePatent(@PathVariable UUID id, @RequestBody Patent patent) {
		Optional<Patent> patentOptional = patentService.updatePatent(id, patent);
		return patentOptional.map(patentMapper::toDTO).orElseThrow(() -> new RuntimeException("Patent not found with id: " + id));
	}
	
	@DeleteMapping("/{id}")
	public void deletePatent(@PathVariable UUID id) {
		patentService.deletePatent(id);
	}
}
