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
import com.backend.app.model.User;
import com.backend.app.repository.TagRepository;
import com.backend.app.repository.UserRepository;

@Component
public class ProjectMapper {
	@Autowired
    private TagMapper tagMapper;
	
	@Autowired
	private TagRepository tagRepository;
	
	@Autowired
	private UserRepository userRepository;
	
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
		
		if(project.getUsers() != null) {
			Set<Long> userIds = project.getUsers().stream().map(User::getId).collect(Collectors.toSet());
			projectDTO.setUserIds(userIds);
		} else {
			projectDTO.setUserIds(new HashSet<>());
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
      
      if (projectDTO.getUserIds() != null && !projectDTO.getUserIds().isEmpty()) {
      	Set<User> users = new HashSet<User>(userRepository.findAllById(projectDTO.getUserIds()));
        	project.setUsers(users);
        } else {
      	  project.setUsers(new HashSet<>());
        }
        
      return project;
	}
	
	public ProjectResponse toResponse(Project project) {
		if(project == null) {
			return null;
		}
		
		ProjectResponse response = new ProjectResponse();
	       
		response.setId(project.getId());
	    response.setType(project.getType());
	    response.setTitle(project.getTitle());
	    response.setProgress(project.getProgress());
	    response.setDescription(project.getDescription());
	    response.setCreatedAt(project.getCreatedAt());
	    response.setUpdatedAt(project.getUpdatedAt());
	    
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

