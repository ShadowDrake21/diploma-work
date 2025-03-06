package com.backend.app.mapper;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.backend.app.dto.ProjectDTO;
import com.backend.app.dto.TagDTO;
import com.backend.app.model.Project;
import com.backend.app.model.ProjectTag;
import com.backend.app.model.Tag;
import com.backend.app.repository.TagRepository;

@Component
public class ProjectMapper {
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
			Set<UUID> tagIds = project.getTags().stream().map(projectTag -> projectTag.getTag().getId()).collect(Collectors.toSet());
			projectDTO.setTagIds(tagIds);
		}
		
		return projectDTO;
	}
	
	public Project toEntity(ProjectDTO projectDTO, List<Tag> tags) {
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
      
      if(tags != null) {
    	  Set<ProjectTag> projectTags = tags.stream().map(tag -> {
    		  ProjectTag projectTag = new ProjectTag();
              projectTag.setProject(project);
              projectTag.setTag(tag);
              return projectTag;
    	  }).collect(Collectors.toSet());
    	  project.setTags(projectTags);
      }
		
      return project;
	}
}

