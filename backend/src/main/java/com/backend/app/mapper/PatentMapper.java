package com.backend.app.mapper;

import java.time.LocalDate;
import java.util.UUID;

import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

import com.backend.app.dto.PatentDTO;
import com.backend.app.dto.ProjectDTO;
import com.backend.app.model.Patent;
import com.backend.app.model.Project;
import com.backend.app.model.User;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;

@Component
public class PatentMapper {	

	private final ProjectRepository projectRepository;
	private final UserRepository userRepository;

    public PatentMapper(ProjectRepository projectRepository, UserRepository userRepository) {
		this.projectRepository = projectRepository;
		this.userRepository = userRepository;
	}	
    
	public PatentDTO toDTO(Patent patent) {
		if(patent == null) {
			return null;
		}
		
		PatentDTO patentDTO = new PatentDTO();
		
		patentDTO.setId(patent.getId());
		patentDTO.setProjectId(patent.getProject().getId());
		patentDTO.setPrimaryAuthorId(patent.getPrimaryAuthor().getId());
		patentDTO.setRegistrationNumber(patent.getRegistrationNumber());
		patentDTO.setRegistrationDate(patent.getRegistrationDate());
		patentDTO.setIssuingAuthority(patent.getIssuingAuthority());
		
		return patentDTO;
	}
	
	public Patent toEntity(PatentDTO patentDTO) {
      if (patentDTO == null) {
      return null;
  }
      Patent patent = new Patent();
      
      patent.setId(patentDTO.getId());
      patent.setProject(getProjectById(patentDTO.getProjectId()));
      patent.setPrimaryAuthor(getAuthorById(patentDTO.getPrimaryAuthorId()));
      patent.setRegistrationNumber(patentDTO.getRegistrationNumber());
		patent.setRegistrationDate(patentDTO.getRegistrationDate());
		patent.setIssuingAuthority(patentDTO.getIssuingAuthority());
		
		
      return patent;
	}
	

	
	 private Project getProjectById(UUID projectId) {
	    	return projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
	    }
	 
	 private User getAuthorById(Long authorId) {
	    	return userRepository.findById(authorId).orElseThrow(() -> new RuntimeException("User not found"));
	    }
}
