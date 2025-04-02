package com.backend.app.mapper;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.backend.app.dto.ProjectDTO;
import com.backend.app.dto.TagDTO;
import com.backend.app.model.Project;
import com.backend.app.model.ProjectResponse;
import com.backend.app.model.ProjectTag;
import com.backend.app.model.Tag;
import com.backend.app.repository.TagRepository;

@Component
public class ProjectMapper {
	@Autowired
    private TagMapper tagMapper;
	
	@Autowired
	private TagRepository tagRepository;
	
	public ProjectDTO toDTO(Project project) {
		if(project == null) {
			return null;
		}
		
		ProjectDTO projectDTO = new ProjectDTO();
		
		projectDTO.setId(project.getId());
		projectDTO.setType(project.getType());
		projectDTO.setTitle(project.getTitle());
		projectDTO.setProgress(project.getProgress());
		projectDTO.setDescription(project.getDescription());
		projectDTO.setCreatedAt(project.getCreatedAt());
		projectDTO.setUpdatedAt(project.getUpdatedAt());
		
		if(project.getTags() != null) {
			Set<UUID> tagIds = project.getTags().stream().map(Tag::getId).collect(Collectors.toSet());
			projectDTO.setTagIds(tagIds);
		} else {
			projectDTO.setTagIds(new HashSet<>());
	      }
		
		return projectDTO;
	}
	
	public Project toEntity(ProjectDTO projectDTO) {
      if (projectDTO == null) {
      return null;
  }
      Project project = new Project();
       
      project.setId(projectDTO.getId());
      project.setType(projectDTO.getType());
      project.setTitle(projectDTO.getTitle());
      project.setProgress(projectDTO.getProgress());
      project.setDescription(projectDTO.getDescription());
      project.setCreatedAt(projectDTO.getCreatedAt());
      project.setUpdatedAt(projectDTO.getUpdatedAt());
      
      if (projectDTO.getTagIds() != null && !projectDTO.getTagIds().isEmpty()) {
    	Set<Tag> tags = new HashSet<Tag>(tagRepository.findAllById(projectDTO.getTagIds()));
      	project.setTags(tags);
      } else {
    	  project.setTags(new HashSet<>());
      }
      
		
      return project;
	}
	
	public ProjectResponse toResponse(Project project) {
		if(project == null) {
			return null;
		}
		
		ProjectResponse response = new ProjectResponse();
	       
		response.setId(response.getId());
	    response.setType(response.getType());
	    response.setTitle(response.getTitle());
	    response.setProgress(response.getProgress());
	    response.setDescription(response.getDescription());
	    response.setCreatedAt(response.getCreatedAt());
	    response.setUpdatedAt(response.getUpdatedAt());
	    
	    if (project.getTags() != null) {
            Set<TagDTO> tagDTOs = project.getTags().stream()
                .map(tagMapper::toDTO)
                .collect(Collectors.toSet());
            response.setTags(tagDTOs);
        } else {
            response.setTags(new HashSet<>());
        }
	    
	    return response;
	}
}

