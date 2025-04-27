package com.backend.app.mapper;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

import com.backend.app.dto.PatentDTO;
import com.backend.app.dto.UserDTO;
import com.backend.app.model.Patent;
import com.backend.app.model.PatentCoInventor;
import com.backend.app.model.Project;
import com.backend.app.model.User;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;

import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Mapper for converting between Patent entities and DTOs
 * */
@Slf4j
@Component
@Validated
@RequiredArgsConstructor
public class PatentMapper {	
	private final ProjectRepository projectRepository;
	private final UserRepository userRepository;	
    
	 /**
     * Converts Patent entity to PatentDTO
     * @param patent the patent entity to convert
     * @return PatentDTO or null if input is null
     */
	public PatentDTO toDTO(Patent patent) {
		if(patent == null) {
			return null;
		}
		
		try {
			return PatentDTO.builder()
					.id(patent.getId())
					.projectId(patent.getProject().getId())
					.primaryAuthorId(patent.getPrimaryAuthor().getId())
					.primaryAuthor(mapToUserDTO(patent.getPrimaryAuthor()))
					.registrationNumber(patent.getRegistrationNumber())
					.registrationDate(patent.getRegistrationDate())
		            .issuingAuthority(patent.getIssuingAuthority())
		            .coInventors(mapCoInventorIds(patent))
		            .build();
		} catch (Exception e) {
			log.error("Error mapping Patent to DTO", e);
			throw new ValidationException("Error mapping patent data");
		}
	}
	
	 /**
     * Converts PatentDTO to Patent entity
     * @param patentDTO the DTO to convert
     * @return Patent entity or null if input is null
     * @throws ValidationException if required fields are missing
     */
	public Patent toEntity(PatentDTO patentDTO) {
      if (patentDTO == null) {
    	  return null;
      }
      
      try {
          Patent patent = new Patent();
          patent.setId(patentDTO.getId());
          patent.setProject(getProjectById(patentDTO.getProjectId()));
          
          if (patentDTO.getPrimaryAuthorId() != null) {
        	  patent.setPrimaryAuthor(getUserById(patentDTO.getPrimaryAuthorId()));
          } else {
        	  throw new ValidationException("Primary author ID is required");
          }
          
          patent.setRegistrationNumber(patentDTO.getRegistrationNumber());
          patent.setRegistrationDate(patentDTO.getRegistrationDate());
          patent.setIssuingAuthority(patentDTO.getIssuingAuthority());
          
          addCoInventorsToPatent(patent, patentDTO.getCoInventors());
          
          return patent;
	} catch (Exception e) {
		log.error("Error mapping DTO to Patent", e);
        throw new ValidationException("Error creating patent: " + e.getMessage());
	}
}
	
	 /**
     * Maps User entity to UserDTO
     */
	private UserDTO mapToUserDTO(User user) {
		if(user == null) {
			return null;
		}
		
		return UserDTO.builder().id(user.getId()).email(user.getEmail()).username(user.getUsername()).role(user.getRole()).build();
	}
	
	/**
     * Extracts co-inventor IDs from Patent entity
     */
	private List<Long> mapCoInventorIds(Patent patent) {
		return patent.getCoInventors().stream()
				.map(coInventor -> coInventor.getUser().getId())
				.filter(Objects::nonNull)
				.collect(Collectors.toList());
	}
	
	/**
     * Adds co-inventors to patent entity
     */
	private void addCoInventorsToPatent(Patent patent, List<Long> coInventorIds) {
		if(coInventorIds == null || coInventorIds.isEmpty()) {
			return;
		}
		
		coInventorIds.stream()
		.filter(Objects::nonNull)
		.map(this::getUserById)
		.filter(Objects::nonNull)
		.forEach(user -> {
			PatentCoInventor coInventor = new PatentCoInventor();
            coInventor.setPatent(patent);
            coInventor.setUser(user);
            patent.addCoInventor(coInventor);
		});
	}

	 /**
     * Fetches project by ID with validation
     */
	private Project getProjectById(UUID projectId) {
		return projectRepository.findById(projectId)
				.orElseThrow(() -> {
					String message = "Project not found with ID: " + projectId;
					log.error(message);
					return new ValidationException(message);
				});
	}
	
	
	/**
     * Fetches user by ID with validation
     */
	 private User getUserById(Long userId) {
	     return userRepository.findById(userId)
	                .orElseThrow(() -> {
	                    String message = "User not found with ID: " + userId;
	                    log.error(message);
	                    return new ValidationException(message);
	                });
	    }
}
