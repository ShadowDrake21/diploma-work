package com.backend.app.controller;

import java.time.LocalDateTime;
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
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.PatentDTO;
import com.backend.app.dto.ProjectDTO;
import com.backend.app.dto.PublicationDTO;
import com.backend.app.dto.ResearchDTO;
import com.backend.app.mapper.PatentMapper;
import com.backend.app.mapper.ProjectMapper;
import com.backend.app.mapper.PublicationMapper;
import com.backend.app.mapper.ResearchMapper;
import com.backend.app.model.Patent;
import com.backend.app.model.Project;
import com.backend.app.model.Publication;
import com.backend.app.model.Research;
import com.backend.app.service.PatentService;
import com.backend.app.service.ProjectService;
import com.backend.app.service.PublicationService;
import com.backend.app.service.ResearchService;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
	private ProjectService projectService;
	private ProjectMapper projectMapper;
	
    private PublicationService publicationService; 
    private PublicationMapper publicationMapper;
    
    private PatentService patentService;
    private PatentMapper patentMapper;
    
    private ResearchService researchService;
    private ResearchMapper researchMapper;
	
	public ProjectController(
			ProjectService projectService,
			ProjectMapper projectMapper, 
			PublicationService publicationService,
			PublicationMapper publicationMapper,
			PatentService patentService, 
			PatentMapper patentMapper,
			ResearchService researchService,
			ResearchMapper researchMapper) {
		this.projectService = projectService;
		this.projectMapper = projectMapper;
		this.publicationService = publicationService;
		this.publicationMapper = publicationMapper;
		this.patentService = patentService;
		this.patentMapper = patentMapper;
		this.researchService = researchService;
		this.researchMapper = researchMapper;
	}

	@GetMapping
	public List<ProjectDTO> getAllProjects(){
		return projectService.findAllProjects().stream().map(projectMapper::toDTO).collect(Collectors.toList());
	}
	
	@GetMapping("/{id}")
	public ProjectDTO getProjectById(@PathVariable UUID id) {
		Optional<Project> projectOptional = projectService.findProjectById(id);
		return projectOptional.map(projectMapper::toDTO)
	            .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
	}
	
	@PostMapping
    public ResponseEntity<ProjectDTO> createProject(@RequestBody ProjectDTO projectDTO) {
        // Log the incoming payload
        System.out.println("Received payload from frontend:");
        System.out.println("Title: " + projectDTO.getTitle());
        System.out.println("Description: " + projectDTO.getDescription());
        System.out.println("Type: " + projectDTO.getType());
        System.out.println("Progress: " + projectDTO.getProgress());
        System.out.println("Tags: " + projectDTO.getTags());

        // Process the payload
        ProjectDTO createdProject = projectService.createProject(projectDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
    }
	
	@PutMapping("/{id}")
	public ProjectDTO updateProject(@PathVariable UUID id, @RequestBody Project project) {
		Optional<Project> projectOptional =projectService.updateProject(id, project);
		return projectOptional.map(projectMapper::toDTO).orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
	}
	
	@DeleteMapping("/{id}")
	public void deleteProject(@PathVariable UUID id) {
		projectService.deleteProject(id);
	}
	
	@GetMapping("/{id}/publication")
	public ResponseEntity<PublicationDTO> getPublicationByProjectId(@PathVariable UUID id) {
		List<Publication> publications = publicationService.findPublicationByProjectId(id);
		System.out.println("publication ");
		if(!publications.isEmpty()) {
			Publication publication = publications.get(0);
			return ResponseEntity.ok(publicationMapper.toDTO(publication));
		}
		
		return ResponseEntity.notFound().build();
	}
	
	@GetMapping("/{id}/patent")
	public ResponseEntity<PatentDTO> getPatentByProjectId(@PathVariable UUID id) {
		List<Patent> patents = patentService.findPatentByProjectId(id);
		
		if(!patents.isEmpty()) {
			Patent patent = patents.get(0);
			return ResponseEntity.ok(patentMapper.toDTO(patent));
		}
		
		return ResponseEntity.notFound().build();
	}
	
	@GetMapping("/{id}/research")
	public ResponseEntity<ResearchDTO> getResearchByProjectId(@PathVariable UUID id) {
		List<Research> researches = researchService.findResearchByProjectId(id);
		
		if(!researches.isEmpty()) {
			Research research = researches.get(0);
			return ResponseEntity.ok(researchMapper.toDTO(research));
		}
		
		return ResponseEntity.notFound().build();
	}
}
