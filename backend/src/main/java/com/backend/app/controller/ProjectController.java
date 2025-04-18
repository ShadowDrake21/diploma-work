package com.backend.app.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;


import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable; 
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.PatentDTO;
import com.backend.app.dto.ProjectDTO;
import com.backend.app.dto.ProjectSearchCriteria;
import com.backend.app.dto.PublicationDTO;
import com.backend.app.dto.ResearchDTO;
import com.backend.app.enums.ProjectType;
import com.backend.app.mapper.PatentMapper;
import com.backend.app.mapper.ProjectMapper;
import com.backend.app.mapper.PublicationMapper;
import com.backend.app.mapper.ResearchMapper;
import com.backend.app.model.Patent;
import com.backend.app.model.Project;
import com.backend.app.model.ProjectResponse;
import com.backend.app.model.Publication;
import com.backend.app.model.Research;
import com.backend.app.model.User;
import com.backend.app.service.PatentService;
import com.backend.app.service.ProjectService;
import com.backend.app.service.PublicationService;
import com.backend.app.service.ResearchService;
import com.backend.app.service.UserService;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/projects")
@Validated
public class ProjectController {
	private ProjectService projectService;
	private ProjectMapper projectMapper;
	
    private PublicationService publicationService; 
    private PublicationMapper publicationMapper;
    
    private PatentService patentService;
    private PatentMapper patentMapper;
    
    private ResearchService researchService;
    private ResearchMapper researchMapper;
    
    private UserService userService;
	
	public ProjectController(
			ProjectService projectService,
			ProjectMapper projectMapper, 
			PublicationService publicationService,
			PublicationMapper publicationMapper,
			PatentService patentService, 
			PatentMapper patentMapper,
			ResearchService researchService,
			ResearchMapper researchMapper, UserService userService) {
		this.projectService = projectService;
		this.projectMapper = projectMapper;
		this.publicationService = publicationService;
		this.publicationMapper = publicationMapper;
		this.patentService = patentService;
		this.patentMapper = patentMapper;
		this.researchService = researchService;
		this.researchMapper = researchMapper;
		this.userService = userService;
	}

	@GetMapping
	public List<ProjectDTO> getAllProjects(){
		return projectService.findAllProjects().stream().map(projectMapper::toDTO).collect(Collectors.toList());
	}
	
	@GetMapping("/{id}")
	public ProjectDTO getProjectById(@PathVariable UUID id) {
	    System.out.println("id getProjectid " + id);
	    Optional<Project> projectOptional = projectService.findProjectById(id);
	    if (projectOptional.isPresent()) {
	        System.out.println("project present");
	        Project project = projectOptional.get();
	        System.out.println("Project data: " + project); // Log the project data
	        return projectMapper.toDTO(project);
	    } else {
	        throw new RuntimeException("Project not found with id: " + id);
	    }
	}
	
	@PostMapping
    public ResponseEntity<Project> createProject(@RequestBody ProjectDTO projectDTO, Authentication authentication) {
		String email = authentication.getName();
		User creator = userService.getUserByEmail(email).orElseThrow(() -> new EntityNotFoundException("User not found"));

		
        Project createdProject = projectService.createProject(projectDTO, creator.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
    }
	
	@PutMapping("/{id}")
	public ProjectDTO updateProject(@PathVariable UUID id, @RequestBody ProjectDTO projectDTO) {
		System.out.println("Received update request for project ID: " + id);
	    System.out.println("Project update data: " + projectDTO.getTagIds());
	    projectDTO.getTagIds().forEach(tagId -> System.out.println("update Tag ID: " + tagId));

		Optional<Project> updatedProject =projectService.updateProject(id, projectDTO);
		return updatedProject.map(projectMapper::toDTO).orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
	}
	
	@DeleteMapping("/{id}")
	public void deleteProject(@PathVariable UUID id) {
		projectService.deleteProject(id);
	}
	
	@GetMapping("/creator/{userId}")
	public ResponseEntity<List<ProjectDTO>> getProjectsByCreator(@PathVariable Long userId) {
		List<Project> projects = projectService.findProjectsByCreator(userId);
		List<ProjectDTO> projectDTOs = projects.stream().map(projectMapper::toDTO).collect(Collectors.toList());
		return ResponseEntity.ok(projectDTOs);
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
	
	@GetMapping("/search")
	public ResponseEntity<Page<ProjectResponse>> searchProject(
			 @RequestParam(required = false) String search,
	            @RequestParam(required = false) @Parameter(description = "Comma-separated list of project types") List<ProjectType> types,
	            @RequestParam(required = false) @Parameter(description = "Comma-separated list of tag IDs") List<UUID> tags,
	            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
	            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
	            @RequestParam(defaultValue = "0") @Min(0) @Max(100) int progressMin,
	            @RequestParam(defaultValue = "100") @Min(0) @Max(100) int progressMax,
	            @RequestParam(required = false) String publicationSource,
	            @RequestParam(required = false) String doiIsbn,
	            @RequestParam(required = false) @DecimalMin("0.00") BigDecimal minBudget,
	            @RequestParam(required = false) @DecimalMin("0.00") BigDecimal maxBudget,
	            @RequestParam(required = false) String fundingSource,
	            @RequestParam(required = false) String registrationNumber,
	            @RequestParam(required = false) String issuingAuthority,
	            @ParameterObject Pageable pageable
			){
		ProjectSearchCriteria criteria =new  ProjectSearchCriteria(
				search,types,tags,  startDate, endDate, progressMin, progressMax,  publicationSource,
				 doiIsbn,  minBudget,  maxBudget,  fundingSource,  registrationNumber,
				 issuingAuthority
				);
		
		Page<Project> projects = projectService.searchProjects(criteria, pageable);
		Page<ProjectResponse> response = projects.map(projectMapper::toResponse);
				
		return ResponseEntity.ok(response);
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
