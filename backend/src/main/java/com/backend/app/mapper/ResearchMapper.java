package com.backend.app.mapper;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.backend.app.dto.ResearchDTO;
import com.backend.app.model.Project;
import com.backend.app.model.Research;
import com.backend.app.repository.ProjectRepository;

@Component
public class ResearchMapper {
	private final ProjectRepository projectRepository;

    public ResearchMapper(ProjectRepository projectRepository) {
		this.projectRepository = projectRepository;
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
		
		
      return research;
	}
	

	
	 private Project getProjectById(UUID projectId) {
	    	return projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
	    }
	 
	 
}
