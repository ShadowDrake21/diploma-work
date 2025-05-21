package com.backend.app.service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.backend.app.dto.miscellaneous.ProjectSearchCriteria;
import com.backend.app.dto.miscellaneous.ProjectWithDetailsDTO;
import com.backend.app.dto.model.PatentDTO;
import com.backend.app.dto.model.ProjectDTO;
import com.backend.app.dto.model.PublicationDTO;
import com.backend.app.dto.model.ResearchDTO;
import com.backend.app.mapper.PatentMapper;
import com.backend.app.mapper.ProjectMapper;
import com.backend.app.mapper.PublicationMapper;
import com.backend.app.mapper.ResearchMapper;
import com.backend.app.model.FileMetadata;
import com.backend.app.model.Project;
import com.backend.app.model.Tag;
import com.backend.app.model.User;
import com.backend.app.repository.FileMetadataRepository;
import com.backend.app.repository.PatentRepository;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.PublicationRepository;
import com.backend.app.repository.ResearchRepository;
import com.backend.app.repository.TagRepository;
import com.backend.app.repository.UserRepository;

import io.jsonwebtoken.lang.Assert;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service class for handling project-related business logic including CRUD
 * operations, searching, and file management
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {
	private final ProjectRepository projectRepository;
	private final TagRepository tagRepository;
	private final S3Service s3Service;
	private final FileMetadataRepository fileMetadataRepository;
	private final PublicationRepository publicationRepository;
	private final PublicationMapper publicationMapper;
	private final PatentRepository patentRepository;
	private final PatentMapper patentMapper;
	private final ResearchRepository researchRepository;
	private final ResearchMapper researchMapper;
	private final ProjectSpecificationService specificationService;
	private final ProjectMapper projectMapper;
	private final UserRepository userRepository;

	@PersistenceContext
	private EntityManager entityManager;

	// ========== READ OPERATIONS ========== //

	/**
	 * Retrieves all projects from the repository.
	 * 
	 * @return List of all projects ordered by creation date (newest first)
	 */
	public Page<Project> findAllProjects(Pageable pageable) {
		return projectRepository.findAll(PageRequest.of(pageable.getPageNumber(),
				pageable.getPageSize(),
				Sort.by(Sort.Direction.DESC, "createdAt")));
	}
	
	public List<Project> findAllProjects() {
        return projectRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

	/**
	 * Finds a project by its unique identifier.
	 * 
	 * @param id The UUID of the project to retrieve (must not be null)
	 * @return Optional containing the found project or empty if not found
	 * @throws IllegalArgumentException if id is null
	 */
	public Optional<Project> findProjectById(UUID id) {
		Assert.notNull(id, "Project ID must not be null");
		return projectRepository.findById(id);
	}

	/**
	 * Searches projects based on multiple criteria with pagination support.
	 * 
	 * @param criteria The search criteria including filters and sorting options
	 * @param pageable Pagination configuration (page number, size, and sorting)
	 * @return Page of projects matching the criteria
	 */
	public Page<Project> searchProjects(ProjectSearchCriteria criteria, Pageable pageable) {
		Specification<Project> spec = specificationService.buildSpecification(criteria);
		return projectRepository.findAll(spec, PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt")));
	}

	/**
	 * Finds projects associated with a specific user.
	 * 
	 * @param userId The ID of the user (must not be null)
	 * @return List of projects created by the specified user
	 * @throws IllegalArgumentException if userId is null
	 */
	public Page<Project> findProjectsByUserId(Long userId, Pageable pageable) {
		Assert.notNull(userId, "User ID must not be null");
		return projectRepository.findByCreatorId(userId, PageRequest.of(pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")));
	}
	
	public List<Project> findProjectsByUserId(Long userId) {
		Assert.notNull(userId, "User ID must not be null");
		return projectRepository.findByCreatorId(userId);
	}


	/**
	 * Retrieves the most recently created projects.
	 * 
	 * @param limit Maximum number of projects to return (must be positive)
	 * @return List of newest projects ordered by creation date
	 * @throws IllegalArgumentException if limit is not positive
	 */
	public Page<Project> findNewestProjects(int limit, Pageable pageable) {
		Assert.isTrue(limit > 0, "Limit must be positive");
		 return projectRepository.findAll(
			        PageRequest.of(pageable.getPageNumber(), limit, Sort.by(Sort.Direction.DESC, "createdAt")));
	}

	public Page<Project> findProjectsByCreator(Long creatorId, Pageable pageable) {
		Assert.notNull(creatorId, "Creator ID must not be null");
        return projectRepository.findByCreatorId(
            creatorId,
            PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
            )
        );
	}
	
	public Page<ProjectWithDetailsDTO<?>> findAllProjectsWithDetails(Pageable pageable) {
		Page<Project> projects = projectRepository.findAllWithDetails(pageable);
		
		return projects.map(project ->{
			ProjectDTO projectDTO = projectMapper.toDTO(project);
			
			switch (project.getType()) {
			case PUBLICATION: 
				
				PublicationDTO pubDto = publicationRepository.findByProjectId(project.getId())
						.stream().findFirst().map(publicationMapper::toDTO).orElse(null);
				return new ProjectWithDetailsDTO<PublicationDTO>(projectDTO, pubDto);
				
			case PATENT:
                PatentDTO patentDto = patentRepository.findByProjectId(project.getId())
                    .stream()
                    .findFirst()
                    .map(patentMapper::toDTO)
                    .orElse(null);
                return new ProjectWithDetailsDTO<PatentDTO>(projectDTO, patentDto);
                
            case RESEARCH:
                ResearchDTO researchDto = researchRepository.findByProjectId(project.getId())
                    .stream()
                    .findFirst()
                    .map(researchMapper::toDTO)
                    .orElse(null);
                return new ProjectWithDetailsDTO<ResearchDTO>(projectDTO, researchDto);
                
            default:
                return new ProjectWithDetailsDTO<>(projectDTO, null);
			}
		});
	}

	// ========== CREATE OPERATIONS ========== //

	/**
	 * Creates a new project from DTO with explicit creator specification.
	 * 
	 * @param projectDTO The project data transfer object (must not be null)
	 * @param creatorId  The ID of the user creating the project (must not be null)
	 * @return The created and persisted project entity
	 * @throws EntityNotFoundException if creator user is not found
	 * @throws IllegalStateException   if project type is invalid
	 */
	@Transactional
	public Project createProject(ProjectDTO projectDTO, Long creatorId) {
		Assert.notNull(projectDTO, "ProjectDTO must not be null");
		Assert.notNull(creatorId, "Creator ID must not be null");
		
		User creator = getUserById(creatorId);
		Project project = projectMapper.toEntity(projectDTO);
		project.setCreator(creator);

		validateProjectType(project);
		setProjectTags(project, projectDTO.getTagIds());

		return projectRepository.save(project);
	}

	// ========== UPDATE OPERATIONS ========== //

    /**
     * Updates an existing project with new data from DTO.
     * 
     * @param id The ID of the project to update (must not be null)
     * @param projectDTO The updated project data (must not be null)
     * @return Optional containing the updated project if found, empty otherwise
     * @throws IllegalArgumentException if project type is being changed
     */
	@Transactional
	public Optional<Project> updateProject(UUID id, ProjectDTO projectDTO) {
		Assert.notNull(id, "Project ID must not be null");
		Assert.notNull(projectDTO, "ProjectDTO must not be null");
		
		return projectRepository.findById(id).map(existingProject -> {
			validateProjectTypeChange(existingProject, projectDTO);

			existingProject.setTitle(projectDTO.getTitle());
			existingProject.setDescription(projectDTO.getDescription());
			existingProject.setProgress(projectDTO.getProgress());

			updateProjectTags(existingProject, projectDTO.getTagIds());

			return projectRepository.save(existingProject);
		});
	}
	
	public int bulkUpdateStatus(List<UUID> ids, String status) {
		return projectRepository.updateStatusForProjects(ids, status);
	}


	// ========== DELETE OPERATIONS ========== //

    /**
     * Deletes a project and all its associated files.
     * 
     * @param id The ID of the project to delete (must not be null)
     * @throws EntityNotFoundException if project is not found
     */
	@Transactional
	public void deleteProject(UUID id) {
		Assert.notNull(id, "Project ID must not be null");
		Project project = projectRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + id));
		deleteAssociatedFiles(project.getId());
		projectRepository.delete(project);
	}

	// ========== HELPER FUNCTIONS ========== //
	
	private User getUserById(Long userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
	}

	private void validateProjectType(Project project) {
		if (project.getType() == null) {
			throw new IllegalStateException("Project type cannot be null");
		}
	}

	private void validateProjectTypeChange(Project existingProject, ProjectDTO projectDTO) {
		if (!existingProject.getType().equals(projectDTO.getType())) {
			throw new IllegalArgumentException("Project type cannot be changed");
		}
	}

	private void setProjectTags(Project project, Set<UUID> tagIds) {
		Set<Tag> tags = new HashSet<>(tagRepository.findAllById(tagIds));
		project.setTags(tags);
	}

	private void updateProjectTags(Project project, Set<UUID> tagIds) {
		Set<Tag> newTags = new HashSet<>(tagRepository.findAllById(tagIds));
		project.getTags().clear();
		project.setTags(newTags);
	}

	private void deleteAssociatedFiles(UUID projectId) {
		List<FileMetadata> files = fileMetadataRepository.findByEntityId(projectId);

		files.forEach(file -> {
			String filePath = file.getEntityType().toString().toLowerCase() + "/" + file.getEntityId() + "/"
					+ file.getFileName();
			s3Service.deleteFile(filePath);
			fileMetadataRepository.delete(file);
		});
	}
}
