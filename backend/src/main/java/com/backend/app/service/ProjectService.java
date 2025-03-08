package com.backend.app.service;

import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.app.dto.ProjectDTO;
import com.backend.app.mapper.ProjectMapper;
import com.backend.app.model.Project;
import com.backend.app.model.ProjectTag;
import com.backend.app.model.Tag;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.ProjectTagRepository;
import com.backend.app.repository.TagRepository;

@Service
public class ProjectService {
	@Autowired
	private ProjectRepository projectRepository;
	
	@Autowired
	private TagRepository tagRepository;
	
	 @Autowired
	    private ProjectTagRepository projectTagRepository; 
	
	@Autowired
    private ProjectMapper projectMapper;
	
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
			
			Set<Tag> newTags = newProject.getTags();
			Set<Tag> existingTags = existingProject.getTags();
			
			existingTags.removeIf(existingTag -> !newTags.contains(existingTag));
			
			for(Tag newTag : newTags) {
				if(!existingTags.contains(newTag)) {
					existingProject.addTag(newTag);
				}
			}
			return projectRepository.save(existingProject);
		});
}
	 public Project createProject(ProjectDTO projectDTO) {
	        Project project = projectMapper.toEntity(projectDTO);

	        Set<UUID> tagIds = projectDTO.getTagIds() != null ? projectDTO.getTagIds() : new HashSet<>();
	        for (UUID uuid : tagIds) {
				System.out.println("tag id: " + uuid);
			}

	        // Convert DTO to entity
	        
	        Set<Tag> tags = new HashSet<>(tagRepository.findAllById(tagIds));
	        
	        project.setTags(tags);

	        System.out.println("last tags: " + project.getTags().toString());
	        return projectRepository.save(project);
	    }
	
	public void deleteProject(UUID id) {
		projectRepository.deleteById(id);
	}
}
