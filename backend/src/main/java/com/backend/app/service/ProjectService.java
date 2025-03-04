package com.backend.app.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.app.dto.ProjectDTO;
import com.backend.app.model.Project;
import com.backend.app.model.ProjectTag;
import com.backend.app.model.Tag;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.TagRepository;

@Service
public class ProjectService {
	@Autowired
	private ProjectRepository projectRepository;
	
	@Autowired
	private TagRepository tagRepository;
	
	public List<Project> findAllProjects(){
		return projectRepository.findAll();
	}
	
	public Optional<Project> findProjectById(UUID id) {
		return projectRepository.findById(id);
	}
	
	public Optional<Project> updateProject(UUID id, Project newProject) {
		return projectRepository.findById(id).map(existingProject -> {
			existingProject.setType(newProject.getType());
			existingProject.setTitle(newProject.getTitle());
			existingProject.setDescription(newProject.getDescription());
			return projectRepository.save(existingProject);
		});
}
	 public ProjectDTO createProject(ProjectDTO projectDTO) {
	        // Log the incoming payload
	        System.out.println("Received payload in service:");
	        System.out.println("Title: " + projectDTO.getTitle());
	        System.out.println("Description: " + projectDTO.getDescription());
	        System.out.println("Type: " + projectDTO.getType());
	        System.out.println("Progress: " + projectDTO.getProgress());
	        System.out.println("Tags: " + projectDTO.getTags());

	        // Convert DTO to Entity and save the project
	        Project project = new Project();
	        project.setTitle(projectDTO.getTitle());
	        project.setDescription(projectDTO.getDescription());
	        project.setType(projectDTO.getType());
	        project.setProgress(projectDTO.getProgress());

	        // Handle tags (if needed)
	        if (projectDTO.getTags() != null) {
	        	Set<ProjectTag> projectTags = projectDTO.getTags().stream().map(tagId -> {
	        		UUID id = UUID.fromString(tagId);
	        		Tag tag  = tagRepository.findById(id).orElseThrow(() -> new RuntimeException("Tag not found with ID: " + tagId));
                    ProjectTag projectTag = new ProjectTag();
                    projectTag.setProject(project);
                    projectTag.setTag(tag);
                    return projectTag;
                })
                .collect(Collectors.toSet());
	        	project.setTags(projectTags);
 	        }

	        Project savedProject = projectRepository.save(project);

	        // Convert Entity back to DTO and return
	        ProjectDTO savedProjectDTO = new ProjectDTO();
	        savedProjectDTO.setId(savedProject.getId());
	        savedProjectDTO.setTitle(savedProject.getTitle());
	        savedProjectDTO.setDescription(savedProject.getDescription());
	        savedProjectDTO.setType(savedProject.getType());
	        savedProjectDTO.setProgress(savedProject.getProgress());
	        
	        if(savedProject.getTags() != null) {
	        	savedProjectDTO.setTags(savedProject.getTags().stream().map(projectTag -> projectTag.getTag().getId().toString()).collect(Collectors.toSet()));
	        }

	        return savedProjectDTO;
	    }
	
	public Project saveProject(Project project) {
		if(project.getTags() != null) {
			for(ProjectTag projectTag : project.getTags()) {
				projectTag.setProject(project);
			}
		}
		return projectRepository.save(project);
	}
	
	public void deleteProject(UUID id) {
		projectRepository.deleteById(id);
	}
}
