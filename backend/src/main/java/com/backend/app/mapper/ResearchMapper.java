package com.backend.app.mapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.backend.app.dto.ResearchDTO;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.model.Project;
import com.backend.app.model.Research;
import com.backend.app.model.ResearchParticipant;
import com.backend.app.model.User;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Mapper for converting between Research entities and DTOs
 * */
@Component
@RequiredArgsConstructor
public class ResearchMapper {
	private final ProjectRepository projectRepository;
	private final UserRepository userRepository;	
    
	/**
	 * Converts Research entity to ResearchDTO
	 * @param research the entity to convert
	 * @return the DTO or null if input is null
	 * */
	public ResearchDTO toDTO(Research research) {
		if(research == null) {
			return null;
		}
		
		return ResearchDTO.builder()
				.id(research.getId())
				.projectId(research.getProject().getId())
				.budget(research.getBudget())
				.startDate(research.getStartDate())
				.endDate(research.getEndDate())
				.status(research.getStatus())
				.fundingSource(research.getFundingSource())
				.participantIds(getParticipantIds(research))
				.build();
	}
	
	 /**
     * Converts ResearchDTO to Research entity
     * @param researchDTO the DTO to convert
     * @return the entity or null if input is null
     */
	public Research toEntity(ResearchDTO researchDTO) {
      if (researchDTO == null) {
      return null;
  }
      Research research = Research.builder()
    		  .id(researchDTO.getId())
              .project(getProjectById(researchDTO.getProjectId()))
              .budget(researchDTO.getBudget())
              .startDate(researchDTO.getStartDate())
              .endDate(researchDTO.getEndDate())
              .status(researchDTO.getStatus())
              .fundingSource(researchDTO.getFundingSource())
              .build();
		
      addParticipant(research, researchDTO.getParticipantIds());
      return research;
	}
	
	/**
     * Updates an existing Research entity from DTO
     * @param dto the source DTO with updated values
     * @param entity the target entity to update
     */
    public void updateResearchFromDto(ResearchDTO dto, Research entity) {
        if (dto == null || entity == null) {
            return;
        }

        entity.setProject(getProjectById(dto.getProjectId()));
        entity.setBudget(dto.getBudget());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setStatus(dto.getStatus());
        entity.setFundingSource(dto.getFundingSource());
    }

	
	
	private List<Long> getParticipantIds(Research research) {
		return research.getResearchParticipants().stream().map(participant -> participant.getUser().getId()).collect(Collectors.toList());
	}
	
	private void addParticipant(Research research, List<Long> participantIds) {
		Optional.ofNullable(participantIds).ifPresent(ids -> 
		ids.forEach(participantId -> {
			User user = userRepository.findById(participantId).orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + participantId));
			research.addParticipant(new ResearchParticipant(research, user));
		}));
	}

	
	 private Project getProjectById(UUID projectId) {
	    	return projectRepository.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));
	    }
	 
	 
}
