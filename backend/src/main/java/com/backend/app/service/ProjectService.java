package com.backend.app.service;

import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.backend.app.dto.ProjectDTO;
import com.backend.app.dto.ProjectSearchCriteria;
import com.backend.app.mapper.ProjectMapper;
import com.backend.app.model.FileMetadata;
import com.backend.app.model.Project;
import com.backend.app.model.ProjectTag;
import com.backend.app.model.Tag;
import com.backend.app.model.User;
import com.backend.app.repository.FileMetadataRepository;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.ProjectTagRepository;
import com.backend.app.repository.TagRepository;
import com.backend.app.repository.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import jakarta.transaction.Transactional;

@Service
public class ProjectService {
	@Autowired
	private ProjectRepository projectRepository;
	
	@Autowired
	private TagRepository tagRepository;
	
	@Autowired
	private S3Service s3Service;
	 
	@Autowired
	private FileMetadataRepository fileMetadataRepository;
	
	@Autowired
	private ProjectSpecificationService specificationService;
	
	@Autowired
    private ProjectMapper projectMapper;
	
	@Autowired
	private UserRepository userRepository;
	
	@PersistenceContext
	private EntityManager entityManager;
	
	public List<Project> findAllProjects(){
		return projectRepository.findAll();
	}
	
	public Optional<Project> findProjectById(UUID id) {
		return projectRepository.findById(id);
	}
	
	public Optional<Project> updateProject(UUID id, ProjectDTO projectDTO) {
		projectDTO.getTagIds().forEach(tagId -> System.out.println("Tag ID: " + tagId));

	    return projectRepository.findById(id).map(existingProject -> {
	    	if(!existingProject.getType().equals(projectDTO.getType())) {
	    		throw new IllegalArgumentException("Project type cannot be changed.");
	    	}
	    	
            Project updatedProject = projectMapper.toEntity(projectDTO);

            updatedProject.setId(existingProject.getId());

            Set<Tag> newTags = new HashSet<>(tagRepository.findAllById(projectDTO.getTagIds()));
            
            Set<User> newUsers = new HashSet<>(userRepository.findAllById(projectDTO.getUserIds()));
            
            existingProject.getTags().clear();
            existingProject.setTags(newTags);
            
            existingProject.getUsers().clear();
            existingProject.setUsers(newUsers);

            existingProject.setType(updatedProject.getType());
            existingProject.setTitle(updatedProject.getTitle());
            existingProject.setDescription(updatedProject.getDescription());
            existingProject.setProgress(updatedProject.getProgress());

            return projectRepository.save(existingProject);
        });
}
	
	@Transactional
	 public Project createProject(ProjectDTO projectDTO) {
	        Project project = projectMapper.toEntity(projectDTO);
	        
	        Set<Tag> tags = new HashSet<>(tagRepository.findAllById(projectDTO.getTagIds()));
	        project.setTags(tags);
	        
	        Set<User> users = userRepository.findAllById(projectDTO.getUserIds())
                    .stream()
                    .collect(Collectors.toSet());
	        
	        
	        users.forEach(project::addUser);
	        
	        return projectRepository.save(project);
	    }
	 
	 public Page<Project> searchProjects(ProjectSearchCriteria criteria, Pageable pageable){
		 Specification<Project> spec = specificationService.buildSpecification(criteria);
		 return projectRepository.findAll(spec, pageable);
	 }
	 
	 public List<Project> findProjectsByUserId(Long userId) {
		 return projectRepository.findByUserId(userId);
    		}
	
	public void deleteProject(UUID id) {
		Project project = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
		
		List<FileMetadata> files = fileMetadataRepository.findByEntityId(id);
		
		for(FileMetadata file: files) {
			String filePath = file.getEntityType().toString().toLowerCase() + "/" + file.getEntityId() + "/" + file.getFileName();
 			s3Service.deleteFile(filePath);
			fileMetadataRepository.delete(file);
		}
		
		projectRepository.delete(project);
	}
}
