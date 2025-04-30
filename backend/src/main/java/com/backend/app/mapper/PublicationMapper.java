package com.backend.app.mapper;

import java.util.UUID;

import org.hibernate.proxy.HibernateProxy;
import org.springframework.stereotype.Component;

import com.backend.app.dto.PublicationDTO;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.model.Project;
import com.backend.app.model.Publication;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.PublicationAuthorRepository;

import lombok.RequiredArgsConstructor;

/**
 * Mapper for converting between Publication entities and DTOs
 * */
@Component
@RequiredArgsConstructor
public class PublicationMapper {
	private final ProjectRepository projectRepository;
	private final PublicationAuthorRepository publicationAuthorRepository;

	 /**
     * Converts Publication entity to PublicationDTO
     * @param publication the entity to convert
     * @return the DTO or null if input is null
     */
    public PublicationDTO toDTO(Publication publication) {
        if(publication == null) {
            return null;
        }
        
        Project project = resolveProxy(publication.getProject());
        
        return PublicationDTO.builder()
            .id(publication.getId())
            .projectId(project != null ? project.getId() : null)
            .publicationDate(publication.getPublicationDate())
            .publicationSource(publication.getPublicationSource())
            .doiIsbn(publication.getDoiIsbn())
            .startPage(publication.getStartPage())
            .endPage(publication.getEndPage())
            .journalVolume(publication.getJournalVolume())
            .issueNumber(publication.getIssueNumber())
            .authors(publicationAuthorRepository.getAuthorsInfoByPublication(publication))
            .build();
    }

    /**
     * Converts PublicationDTO to Publication entity
     * @param publicationDTO the DTO to convert
     * @return the entity or null if input is null
     */
    public Publication toEntity(PublicationDTO publicationDTO) {
        if (publicationDTO == null) {
            return null;
        }
        
        return Publication.builder()
        		.id(publicationDTO.getId())
        		.project(getProjectById(publicationDTO.getProjectId()))
        		.publicationDate(publicationDTO.getPublicationDate())
                .publicationSource(publicationDTO.getPublicationSource())
                .doiIsbn(publicationDTO.getDoiIsbn())
                .startPage(publicationDTO.getStartPage())
                .endPage(publicationDTO.getEndPage())
                .journalVolume(publicationDTO.getJournalVolume())
                .issueNumber(publicationDTO.getIssueNumber())
                .build();
    }
    
    /**
     * Updates an existing Publication entity from DTO
     * @param dto the source DTO with updated values
     * @param entity the target entity to update
     */
    public void updatePublicationFromDto(PublicationDTO dto, Publication entity) {
        if (dto == null || entity == null) {
            return;
        }

        entity.setProject(getProjectById(dto.getProjectId()));
        entity.setPublicationDate(dto.getPublicationDate());
        entity.setPublicationSource(dto.getPublicationSource());
        entity.setDoiIsbn(dto.getDoiIsbn());
        entity.setStartPage(dto.getStartPage());
        entity.setEndPage(dto.getEndPage());
        entity.setJournalVolume(dto.getJournalVolume());
        entity.setIssueNumber(dto.getIssueNumber());
    }
    
    private Project getProjectById(UUID projectId) {
    	return projectRepository.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));
    }
    
    private Project resolveProxy(Project project) {
    	return project instanceof HibernateProxy ? (Project) 
    			((HibernateProxy) project).getHibernateLazyInitializer().getImplementation() : project;
    }
}
