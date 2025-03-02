package com.backend.app.mapper;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.backend.app.dto.ResearchDTO;
import com.backend.app.dto.ResponseUserDTO;
import com.backend.app.model.Project;
import com.backend.app.model.Research;
import com.backend.app.model.ResearchParticipant;
import com.backend.app.model.User;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;

@Component
public class ResearchMapper {
	private final ProjectRepository projectRepository;
	private final UserRepository userRepository;

    public ResearchMapper(ProjectRepository projectRepository, UserRepository userRepository) {
		this.projectRepository = projectRepository;
		this.userRepository = userRepository;
	}	
    
	public ResearchDTO toDTO(Research research) {
		if(research == null) {
			return null;
		}
		
		ResearchDTO researchDTO = new ResearchDTO();
		
		researchDTO.setId(research.getId());
		researchDTO.setProjectId(research.getProject().getId());
		researchDTO.setBudget(research.getBudget());
		researchDTO.setStartDate(research.getStartDate());
		researchDTO.setEndDate(research.getEndDate());
		researchDTO.setStatus(research.getStatus());
		researchDTO.setFundingSource(research.getFundingSource());

		List<ResponseUserDTO> participantDTOs = research.getResearchParticipants().stream().map(participant -> new ResponseUserDTO(
				participant.getUser().getId(),
				participant.getUser().getUsername()
				)).collect(Collectors.toList());
		
		researchDTO.setParticipants(participantDTOs);
		return researchDTO;
	}
	
	public Research toEntity(ResearchDTO researchDTO) {
      if (researchDTO == null) {
      return null;
  }
      Research research = new Research();
		
      research.setId(researchDTO.getId());
      research.setProject(getProjectById(researchDTO.getProjectId()));
      research.setBudget(researchDTO.getBudget());
      research.setStartDate(researchDTO.getStartDate());
      research.setEndDate(researchDTO.getEndDate());
      research.setStatus(researchDTO.getStatus());
      research.setFundingSource(researchDTO.getFundingSource());
		
      if(researchDTO.getParticipants() != null) {
    	  for(ResponseUserDTO participantDTO : researchDTO.getParticipants()) {
    		  User user = userRepository.findById(participantDTO.getId()).orElseThrow(() -> new RuntimeException("User not found with ID: " + participantDTO.getId()));
    		  ResearchParticipant participant = new ResearchParticipant();
    		  participant.setResearch(research);
    		  participant.setUser(user);
    		  research.addParticipant(participant);
    	  }
      }
		
      return research;
	}
	

	
	 private Project getProjectById(UUID projectId) {
	    	return projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
	    }
	 
	 
}
