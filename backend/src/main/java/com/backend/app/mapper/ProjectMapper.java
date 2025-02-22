package com.backend.app.mapper;

import org.springframework.stereotype.Component;

import com.backend.app.dto.ProjectDTO;
import com.backend.app.model.Project;

@Component
public class ProjectMapper {
	public ProjectDTO toDTO(Project project) {
		if(project == null) {
			return null;
		}
		
		ProjectDTO projectDTO = new ProjectDTO();
		
		projectDTO.setId(project.getId());
		projectDTO.setType(project.getType());
		projectDTO.setTitle(project.getTitle());
		projectDTO.setDescription(project.getDescription());
		projectDTO.setCreatedAt(project.getCreatedAt());
		projectDTO.setUpdatedAt(project.getUpdatedAt());
		
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
      project.setDescription(projectDTO.getDescription());
      project.setCreatedAt(projectDTO.getCreatedAt());
      project.setUpdatedAt(projectDTO.getUpdatedAt());
		
      return project;
	}
}

