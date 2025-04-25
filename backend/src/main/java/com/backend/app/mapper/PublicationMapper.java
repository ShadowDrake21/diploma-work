package com.backend.app.mapper;

import java.util.UUID;

import org.hibernate.proxy.HibernateProxy;
import org.springframework.stereotype.Component;

import com.backend.app.dto.PublicationDTO;
import com.backend.app.model.Project;
import com.backend.app.model.Publication;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.PublicationAuthorRepository;


@Component
public class PublicationMapper {
	private final ProjectRepository projectRepository;
	private final PublicationAuthorRepository publicationAuthorRepository;

    public PublicationMapper(ProjectRepository projectRepository, PublicationAuthorRepository publicationAuthorRepository) {
		this.projectRepository = projectRepository;
		this.publicationAuthorRepository = publicationAuthorRepository;
	}

    public PublicationDTO toDTO(Publication publication) {
        if(publication == null) {
            return null;
        }
        
        Project project = publication.getProject();
        if (project instanceof HibernateProxy) {
            project = (Project) ((HibernateProxy) project).getHibernateLazyInitializer().getImplementation();
        }
        
        return PublicationDTO.builder()
            .id(publication.getId())
            .projectId(project != null ? project.getId() : null)  // Only pass ID
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
