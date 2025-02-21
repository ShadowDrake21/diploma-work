//package com.backend.app.controller;
//
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//import java.util.stream.Collectors;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.backend.app.dto.PublicationDTO;
//import com.backend.app.mapper.PublicationMapper;
//import com.backend.app.model.Publication;
//import com.backend.app.service.PublicationService;
//
//@RestController
//@RequestMapping("/api/publications")
//public class PublicationController {
//	@Autowired
//	private PublicationService publicationService;
//	
//	@Autowired
//	private PublicationMapper publicationMapper;
//	
//	@GetMapping
//	public List<PublicationDTO> getAllPublications(){
//		return publicationService.findAllPublications().stream().map(publicationMapper::toDTO).collect(Collectors.toList());
//	}
//	
//	@GetMapping("/{id}")
//	public PublicationDTO getPublicationById(@PathVariable UUID id) {
//		Optional<Publication> publicationOptional = publicationService.findPublicationById(id);
//		return publicationOptional.map(publicationMapper::toDTO)
//	            .orElseThrow(() -> new RuntimeException("Publication not found with id: " + id));
//	}
//	
//	@PostMapping
//	public PublicationDTO createPublication(@RequestBody Publication publication) {
//		return publicationMapper.toDTO(publicationService.savePublication(publication));
//	}
//	
//	@PutMapping("/{id}")
//	public PublicationDTO updatePublication(@PathVariable UUID id, @RequestBody Publication publication) {
//		Optional<Publication> publicationOptional = publicationService.updatePublication(id, publication);
//		return publicationOptional.map(publicationMapper::toDTO).orElseThrow(() -> new RuntimeException("Publication not found with id: " + id));
//	}
//	
//	@DeleteMapping("/{id}")
//	public void deletePublication(@PathVariable UUID id) {
//		publicationService.deleteProject(id);
//	}
//}
