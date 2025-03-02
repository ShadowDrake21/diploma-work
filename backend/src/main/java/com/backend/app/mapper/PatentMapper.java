package com.backend.app.mapper;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

import com.backend.app.dto.PatentCoInventorDTO;
import com.backend.app.dto.PatentDTO;
import com.backend.app.dto.ProjectDTO;
import com.backend.app.dto.ResponseUserDTO;
import com.backend.app.dto.UserDTO;
import com.backend.app.model.Patent;
import com.backend.app.model.PatentCoInventor;
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
		
		UserDTO userDTO = new UserDTO();
		userDTO.setId(patent.getPrimaryAuthor().getId());
		userDTO.setEmail(patent.getPrimaryAuthor().getEmail());
		userDTO.setUsername(patent.getPrimaryAuthor().getUsername());
		userDTO.setRole(patent.getPrimaryAuthor().getRole());
		
		patentDTO.setPrimaryAuthor(userDTO);
		patentDTO.setRegistrationNumber(patent.getRegistrationNumber());
		patentDTO.setRegistrationDate(patent.getRegistrationDate());
		patentDTO.setIssuingAuthority(patent.getIssuingAuthority());
		
		List<PatentCoInventorDTO> coInventorDTOs = patent.getCoInventors().stream().map(coInventor -> 
		new PatentCoInventorDTO(
				coInventor.getId(), coInventor.getUser().getId(), coInventor.getUser().getUsername())).collect(Collectors.toList());
		 
		patentDTO.setCoInventors(coInventorDTOs);
		
 		return patentDTO;
	}
	
	public Patent toEntity(PatentDTO patentDTO) {
      if (patentDTO == null) {
      return null;
  }
      Patent patent = new Patent();
      
      patent.setId(patentDTO.getId());
      patent.setProject(getProjectById(patentDTO.getProjectId()));
      if(patentDTO.getPrimaryAuthorId() != null) {
    	  User fetchedUser = userRepository.findById(patentDTO.getPrimaryAuthorId()).orElseThrow(() -> new RuntimeException("User not found with ID: " + patentDTO.getPrimaryAuthorId()));    	  
    	  patent.setPrimaryAuthor(fetchedUser);
      }
      patent.setPrimaryAuthor(getAuthorById(patentDTO.getPrimaryAuthorId()));
      patent.setRegistrationNumber(patentDTO.getRegistrationNumber());
	patent.setRegistrationDate(patentDTO.getRegistrationDate());
		patent.setIssuingAuthority(patentDTO.getIssuingAuthority());
		
		if(patentDTO.getCoInventors() != null) {
			for(PatentCoInventorDTO coInventorDTO : patentDTO.getCoInventors()) {
				User user = userRepository.findById(coInventorDTO.getUserId()).orElseThrow(() -> new RuntimeException("User not found with ID: " + coInventorDTO.getUserId()));
				PatentCoInventor coInventor = new PatentCoInventor();
				coInventor.setPatent(patent);
				coInventor.setUser(user);
				patent.addCoInventor(coInventor);
			}
		}
		
      return patent;
	}
	

	
	 private Project getProjectById(UUID projectId) {
	    	return projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
	    }
	 
	 private User getAuthorById(Long authorId) {
	    	return userRepository.findById(authorId).orElseThrow(() -> new RuntimeException("User not found"));
	    }
}
