package com.backend.app.mapper;

import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

import com.backend.app.dto.ProjectDTO;
import com.backend.app.dto.TagDTO;
import com.backend.app.model.Project;
import com.backend.app.model.ProjectResponse;
import com.backend.app.model.Tag;
import com.backend.app.model.User;
import com.backend.app.repository.TagRepository;
import com.backend.app.repository.UserRepository;

import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Mapper for converting between Project entities and DTOs
 */
@Slf4j
@Component
@Validated
@RequiredArgsConstructor
public class ProjectMapper {
    private final TagMapper tagMapper;
	private final TagRepository tagRepository;
	private final UserRepository userRepository;
	
	public ProjectDTO toDTO(Project project) {
		if(project == null) {
			return null;
		}
		
		try {
			return ProjectDTO.builder()
					 .id(project.getId())
	                    .type(project.getType())
	                    .title(project.getTitle())
	                    .progress(project.getProgress())
	                    .description(project.getDescription())
	                    .createdAt(project.getCreatedAt())
	                    .updatedAt(project.getUpdatedAt())
	                    .tagIds(getTagIds(project))
	                    .createdBy(getCreatorId(project))
	                    .build();
		} catch (Exception e) {
			log.error("Error mapping Project to DTO", e);
			throw new ValidationException("Error mapping project data");
		}
	}
	
	public Project toEntity(ProjectDTO projectDTO) {
      if (projectDTO == null) {
    	  return null;
      }
      
      try {
    	  Project.ProjectBuilder builder = Project.builder()
    	            .id(projectDTO.getId())
    	            .type(projectDTO.getType())
    	            .title(projectDTO.getTitle())
    	            .progress(projectDTO.getProgress())
    	            .description(projectDTO.getDescription())
    	            .createdAt(projectDTO.getCreatedAt())
    	            .updatedAt(projectDTO.getUpdatedAt())
    	            .tags(getTags(projectDTO));
    	  
    	  if(projectDTO.getId() == null && projectDTO.getCreatedBy() != null) {
    		  builder.creator(getCreator(projectDTO));
    	  }
    	  
    	  return builder.build();
	} catch (Exception e) {
		log.error("Error mapping DTO to Project", e);
        throw new ValidationException("Error creating project: " + e.getMessage());
	}     
	}
	
	public ProjectResponse toResponse(Project project) {
		if(project == null) {
			return null;
		}
		
		try {
			return ProjectResponse.builder()
					.id(project.getId())
					.id(project.getId())
                    .type(project.getType())
                    .title(project.getTitle())
                    .progress(project.getProgress())
                    .description(project.getDescription())
                    .createdAt(project.getCreatedAt())
                    .updatedAt(project.getUpdatedAt())
                    .tags(getTagDTOs(project))
                    .createdBy(getCreatorId(project))
                    .build();
		} catch (Exception e) {
            log.error("Error mapping Project to Response", e);
            throw new ValidationException("Error mapping project response");
		}
	}
	
	private Set<UUID> getTagIds(Project project) {
		return Optional.ofNullable(project.getTags())
				.map(tags -> tags.stream()
						.map(Tag::getId)
						.collect(Collectors.toSet())).orElse(Collections.emptySet());
	}
	
	private Set<Tag> getTags(ProjectDTO projectDTO) {
		return Optional.ofNullable(projectDTO.getTagIds())
				.filter(ids -> !ids.isEmpty())
				.map(tagRepository::findAllById)
				.map(HashSet::new)
				.orElse(new HashSet<>());
	}
	
	private Set<TagDTO> getTagDTOs(Project project) {
		return Optional.ofNullable(project.getTags())
				.map(tags -> tags.stream()
                        .map(tagMapper::toDTO)
                        .collect(Collectors.toSet()))
                .orElse(Collections.emptySet());
	}
	
	private User getCreator(ProjectDTO projectDTO) {
		  return userRepository.findById(projectDTO.getCreatedBy())
		            .orElseThrow(() -> new ValidationException("Creator user not found with ID: " + projectDTO.getCreatedBy()));
	}
	
	private Long getCreatorId(Project project) {
		return Optional.ofNullable(project.getCreator()).map(User::getId)
				.orElse(null);
	}
}

