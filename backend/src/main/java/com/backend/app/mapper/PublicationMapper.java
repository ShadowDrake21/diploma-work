package com.backend.app.mapper;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.backend.app.dto.PublicationDTO;
import com.backend.app.model.Project;
import com.backend.app.model.Publication;
import com.backend.app.repository.ProjectRepository;

@Component
public class PublicationMapper {
	private final ProjectRepository projectRepository;

    public PublicationMapper(ProjectRepository projectRepository) {
		this.projectRepository = projectRepository;
	}

	public PublicationDTO toDTO(Publication publication) {
        if(publication == null) {
        	return null;
        }
        PublicationDTO publicationDTO = new PublicationDTO();
        
        publicationDTO.setId(publication.getId());
        publicationDTO.setProjectId(publication.getProject().getId());
        publicationDTO.setPublicationDate(publication.getPublicationDate());
        publicationDTO.setPublicationSource(publication.getPublicationSource());
        publicationDTO.setDoiIsbn(publication.getDoiIsbn());
        publicationDTO.setStartPage(publication.getStartPage());
        publicationDTO.setEndPage(publication.getEndPage());
        publicationDTO.setJournalVolume(publication.getJournalVolume());
        publicationDTO.setIssueNumber(publication.getIssueNumber());
        
        return publicationDTO;
    }

    public Publication toEntity(PublicationDTO publicationDTO) {
        if (publicationDTO == null) {
            return null;
        }
        Publication publication = new Publication();
        publication.setId(publicationDTO.getId());
        publication.setProject(getProjectById(publicationDTO.getProjectId()));
        publication.setPublicationDate(publicationDTO.getPublicationDate());
        publication.setPublicationSource(publicationDTO.getPublicationSource());
        publication.setDoiIsbn(publicationDTO.getDoiIsbn());
        publication.setStartPage(publicationDTO.getStartPage());
        publication.setEndPage(publicationDTO.getEndPage());
        publication.setJournalVolume(publicationDTO.getJournalVolume());
        publication.setIssueNumber(publicationDTO.getIssueNumber());
        return publication;
    }
    
    private Project getProjectById(UUID projectId) {
    	return projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"));
    }
}
