package com.backend.app.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.miscellaneous.ProjectSearchCriteria;
import com.backend.app.dto.miscellaneous.ProjectWithDetailsDTO;
import com.backend.app.dto.model.CommentDTO;
import com.backend.app.dto.model.PatentDTO;
import com.backend.app.dto.model.ProjectDTO;
import com.backend.app.dto.model.PublicationDTO;
import com.backend.app.dto.model.ResearchDTO;
import com.backend.app.dto.response.ApiResponse;
import com.backend.app.dto.response.PaginatedResponse;
import com.backend.app.dto.response.ProjectResponse;
import com.backend.app.enums.ProjectType;
import com.backend.app.mapper.CommentMapper;
import com.backend.app.mapper.PatentMapper;
import com.backend.app.mapper.ProjectMapper;
import com.backend.app.mapper.PublicationMapper;
import com.backend.app.mapper.ResearchMapper;
import com.backend.app.model.Project;
import com.backend.app.model.User;
import com.backend.app.service.CommentService;
import com.backend.app.service.PatentService;
import com.backend.app.service.ProjectService;
import com.backend.app.service.PublicationService;
import com.backend.app.service.ResearchService;
import com.backend.app.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Tag(name = "Project Management", description = "Endpoints for managing projects and related entities")
@RestController
@RequestMapping("/api/projects")
@Validated
@RequiredArgsConstructor
public class ProjectController {
	private final ProjectService projectService;
	private final ProjectMapper projectMapper;
	private final PublicationService publicationService;
	private final PublicationMapper publicationMapper;
	private final PatentService patentService;
	private final PatentMapper patentMapper;
	private final ResearchService researchService;
	private final ResearchMapper researchMapper;
	private final UserService userService;

	@Operation(summary = "Get all projects with pagination")
	@GetMapping
	public ResponseEntity<PaginatedResponse<ProjectDTO>> getAllProjects(@ParameterObject Pageable pageable) {
		log.debug("Fetching al projects");
		try {
			Page<ProjectDTO> projects = projectService.findAllProjects(pageable).map(projectMapper::toDTO);
			return ResponseEntity.ok(PaginatedResponse.success(projects));
		} catch (Exception e) {
			log.error("Error fetching projects: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(PaginatedResponse.error("Failed to fetch projects"));
		}
	}

	@Operation(summary = "Get project by ID")
	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<ProjectDTO>> getProjectById(
			@Parameter(description = "ID of the project to retrieve") @PathVariable UUID id) {
		log.debug("Fetching project with ID: {}", id);
		return projectService.findProjectById(id).map(projectMapper::toDTO)
				.map(dto -> ResponseEntity.ok(ApiResponse.success(dto))).orElseGet(() -> {
					log.error("Project not found with ID: {}", id);
					return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Project not found"));
				});
	}

	@Operation(summary = "Create a new project")
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ResponseEntity<ApiResponse<UUID>> createProject(@Valid @RequestBody ProjectDTO projectDTO,
			Authentication authentication) {
		log.debug("Creating new project: {}", projectDTO.getTitle());

		try {
			User creator = userService.getUserByEmail(authentication.getName()).orElseThrow(() -> {
				log.error("User not found with email: {}", authentication.getName());
				return new EntityNotFoundException("User not found");
			});

			projectDTO.setCreatedBy(creator.getId());

			Project createdProject = projectService.createProject(projectDTO, creator.getId());
			log.info("Created project with ID: {}", createdProject.getId());

			return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(createdProject.getId()));

		} catch (EntityNotFoundException e) {
			log.error("Error creating project: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
		} catch (Exception e) {
			log.error("Error creating project: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(ApiResponse.error("Failed to create project"));
		}
	}

	@Operation(summary = "Update an existing project")
	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<UUID>> updateProject(
			@Parameter(description = "ID of the project to update") @PathVariable UUID id,
			@Valid @RequestBody ProjectDTO projectDTO) {
		log.debug("Updating project with ID: {}", id);
		try {
			Project updatedProject = projectService.updateProject(id, projectDTO).orElseThrow(() -> {
				log.error("Failed to update project with ID: {}", id);
				return new EntityNotFoundException("Project not found with id: " + id);
			});
			log.info("Successfully updated project with ID: {}", id);
			return ResponseEntity.ok(ApiResponse.success(updatedProject.getId()));
		} catch (EntityNotFoundException e) {
			log.error("Error updating project: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
		} catch (Exception e) {
			log.error("Error updating project: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(ApiResponse.error("Failed to update project"));
		}

	}

	@Operation(summary = "Delete a project")
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public ResponseEntity<ApiResponse<Void>> deleteProject(
			@Parameter(description = "ID of the project to delete") @PathVariable UUID id) {
		log.debug("Deleting project with ID: {}", id);
		try {
			projectService.deleteProject(id);
			log.info("Successfully deleted project with ID: {}", id);
			return ResponseEntity.noContent().build();
		} catch (EntityNotFoundException e) {
			log.error("Error deleting project: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
		} catch (Exception e) {
			log.error("Error deleting project: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(ApiResponse.error("Failed to delete project"));
		}

	}

	@Operation(summary = "Get projects by creator with pagination")
	@GetMapping("/creator/{userId}")
	public ResponseEntity<PaginatedResponse<ProjectDTO>> getProjectsByCreator(
			@Parameter(description = "ID of the creator user") @PathVariable Long userId,
			@ParameterObject Pageable pageable) {
		log.debug("Fetching projects for creator with ID: {}", userId);
		try {
			Page<ProjectDTO> projects = projectService.findProjectsByCreator(userId, pageable)
					.map(projectMapper::toDTO);
			return ResponseEntity.ok(PaginatedResponse.success(projects));
		} catch (Exception e) {
			log.error("Error fetching projects by creator: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(PaginatedResponse.error("Failed to fetch projects by creator"));
		}

	}

	@Operation(summary = "Get publication by project ID")
	@GetMapping("/{id}/publication")
	public ResponseEntity<ApiResponse<PublicationDTO>> getPublicationByProjectId(
			@Parameter(description = "ID of the project") @PathVariable UUID id) {
		log.debug("Fetching publication for project ID: {}", id);
		try {
			PublicationDTO publication = publicationService.findPublicationByProjectId(id).stream().findFirst()
					.map(publicationMapper::toDTO)
					.orElseThrow(() -> new EntityNotFoundException("Publication not found"));
			return ResponseEntity.ok(ApiResponse.success(publication));
		} catch (EntityNotFoundException e) {
			log.warn("No publication found for project ID: {}", id);
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
		} catch (Exception e) {
			log.error("Error fetching publication: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(ApiResponse.error("Failed to fetch publication"));
		}

	}

	@Operation(summary = "Search projects with filters")
	@GetMapping("/search")
	public ResponseEntity<PaginatedResponse<ProjectResponse>> searchProject(
			@Parameter(description = "Search term") @RequestParam(required = false) String search,
			@Parameter(description = "Comma-separated list of project types") @RequestParam(required = false) List<ProjectType> types,
			@Parameter(description = "Comma-separated list of tag IDs") @RequestParam(required = false) List<UUID> tags,
			@Parameter(description = "Start date filter") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
			@Parameter(description = "End date filter") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
			@Parameter(description = "Minimum progress (0-100)") @RequestParam(defaultValue = "0") @Min(0) @Max(100) int progressMin,
			@Parameter(description = "Maximum progress (0-100)") @RequestParam(defaultValue = "100") @Min(0) @Max(100) int progressMax,
			@Parameter(description = "Publication source filter") @RequestParam(required = false) String publicationSource,
			@Parameter(description = "DOI/ISBN filter") @RequestParam(required = false) String doiIsbn,
			@Parameter(description = "Minimum budget") @RequestParam(required = false) @DecimalMin("0.00") BigDecimal minBudget,
			@Parameter(description = "Maximum budget") @RequestParam(required = false) @DecimalMin("0.00") BigDecimal maxBudget,
			@Parameter(description = "Funding source filter") @RequestParam(required = false) String fundingSource,
			@Parameter(description = "Patent registration number") @RequestParam(required = false) String registrationNumber,
			@Parameter(description = "Patent issuing authority") @RequestParam(required = false) String issuingAuthority,
			@ParameterObject Pageable pageable) {
		log.debug("Searching projects with criteria - search: {}, types: {}, tags: {}", search, types, tags);

		try {
			ProjectSearchCriteria criteria = new ProjectSearchCriteria(search, types, tags, startDate, endDate,
					progressMin, progressMax, publicationSource, doiIsbn, minBudget, maxBudget, fundingSource,
					registrationNumber, issuingAuthority);
			Page<ProjectResponse> response = projectService.searchProjects(criteria, pageable)
					.map(projectMapper::toResponse);
			log.info("Found {} projects matching search criteria", response.getTotalElements());
			return ResponseEntity.ok(PaginatedResponse.success(response));
		} catch (Exception e) {
			log.error("Error searching projects: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(PaginatedResponse.error("Failed to search projects"));
		}

	}

	@Operation(summary = "Get patent by project ID")
	@GetMapping("/{id}/patent")
	public ResponseEntity<ApiResponse<PatentDTO>> getPatentByProjectId(
			@Parameter(description = "ID of the project") @PathVariable UUID id) {
		log.debug("Fetching patent for project ID: {}", id);
		try {
			PatentDTO patent = patentService.findPatentByProjectId(id).stream().findFirst().map(patentMapper::toDTO)
					.orElseThrow(() -> new EntityNotFoundException("Patent not found"));

			return ResponseEntity.ok(ApiResponse.success(patent));
		} catch (EntityNotFoundException e) {
			log.warn("No patent found for project ID: {}", id);
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
		} catch (Exception e) {
			log.error("Error fetching patent: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(ApiResponse.error("Failed to fetch patent"));
		}
	}

	@Operation(summary = "Get research by project ID")
	@GetMapping("/{id}/research")
	public ResponseEntity<ApiResponse<ResearchDTO>> getResearchByProjectId(
			@Parameter(description = "ID of the project") @PathVariable UUID id) {
		log.debug("Fetching research for project ID: {}", id);

		try {
			ResearchDTO research = researchService.findResearchByProjectId(id).stream().findFirst()
					.map(researchMapper::toDTO).orElseThrow(() -> new EntityNotFoundException("Research not found"));

			return ResponseEntity.ok(ApiResponse.success(research));
		} catch (EntityNotFoundException e) {
			log.warn("No research found for project ID: {}", id);
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
		} catch (Exception e) {
			log.error("Error fetching research: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(ApiResponse.error("Failed to fetch research"));
		}
	}

	@Operation(summary = "Get newest projects")
	@GetMapping("/newest")
	public ResponseEntity<PaginatedResponse<ProjectDTO>> getNewestProjects(
			@Parameter(description = "Number of projects to return") @RequestParam(defaultValue = "10") @Min(1) @Max(100) int limit,
			@ParameterObject Pageable pageable) {
		log.debug("Fetching {} newest projects", limit);

		try {
			Page<ProjectDTO> projects = projectService.findNewestProjects(limit, pageable).map(projectMapper::toDTO);

			return ResponseEntity.ok(PaginatedResponse.success(projects));
		} catch (Exception e) {
			log.error("Error fetching newest projects: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(PaginatedResponse.error("Failed to fetch newest projects"));
		}

	}

	@Operation(summary = "Get projects by current authenticated user with filters")
	@GetMapping("/mine")
	public ResponseEntity<PaginatedResponse<ProjectDTO>> getMyProjects(
	        @Parameter(description = "Search term") @RequestParam(required = false) String search,
	        @Parameter(description = "Comma-separated list of project types") @RequestParam(required = false) List<ProjectType> types,
	        @Parameter(description = "Comma-separated list of tag IDs") @RequestParam(required = false) List<UUID> tags,
	        @Parameter(description = "Start date filter") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
	        @Parameter(description = "End date filter") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
	        @Parameter(description = "Minimum progress (0-100)") @RequestParam(defaultValue = "0") @Min(0) @Max(100) int progressMin,
	        @Parameter(description = "Maximum progress (0-100)") @RequestParam(defaultValue = "100") @Min(0) @Max(100) int progressMax,
	        @ParameterObject Pageable pageable,
	        Authentication authentication) {
	    log.debug("Fetching filtered projects for current user");
	    try {
	        User user = userService.getUserByEmail(authentication.getName())
	                .orElseThrow(() -> new EntityNotFoundException("User not found"));
	        
	        ProjectSearchCriteria criteria = new ProjectSearchCriteria(
	                search, types, tags, startDate, endDate, 
	                progressMin, progressMax, null, null, null, null, null, null, null);
	        
	        Page<ProjectDTO> projects = projectService.searchUserProjects(user.getId(), criteria, pageable)
	                .map(projectMapper::toDTO);
	        return ResponseEntity.ok(PaginatedResponse.success(projects));
	    } catch (Exception e) {
	        log.error("Error fetching user's projects: {}", e.getMessage());
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body(PaginatedResponse.error("Failed to fetch user's projects"));
	    }
	}

	@Operation(summary = "Get all projects with their typed details")
	@GetMapping("/with-details")
	public ResponseEntity<PaginatedResponse<ProjectWithDetailsDTO<?>>> getAllProjectsWithDetails(
			@ParameterObject Pageable pageable) {
		Page<ProjectWithDetailsDTO<?>> projects = projectService.findAllProjectsWithDetails(pageable);
		return ResponseEntity.ok(PaginatedResponse.success(projects));
	}

}
