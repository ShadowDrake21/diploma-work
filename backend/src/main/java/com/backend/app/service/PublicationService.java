package com.backend.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.backend.app.dto.CreatePublicationRequest;
import com.backend.app.dto.PublicationDTO;
import com.backend.app.dto.ResponseUserDTO;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.mapper.PublicationMapper;
import com.backend.app.model.Project;
import com.backend.app.model.Publication;
import com.backend.app.model.PublicationAuthor;
import com.backend.app.model.User;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.PublicationAuthorRepository;
import com.backend.app.repository.PublicationRepository;
import com.backend.app.repository.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicationService {
	private final PublicationRepository publicationRepository;
	private final ProjectRepository projectRepository;
	private final UserRepository userRepository;
	private final PublicationAuthorRepository publicationAuthorRepository;
	private final PublicationMapper publicationMapper;
	
	@PersistenceContext
	private final EntityManager entityManager;
	
	public List<Publication> findAllPublications(){
		return publicationRepository.findAll();
	}
	
	public PublicationDTO findPublicationById(UUID id) {
	return publicationRepository.findByIdWithRelations(id).map(publicationMapper::toDTO).orElseThrow(() -> new ResourceNotFoundException("Publication not found with ID: " + id));
	}
	
	public List<Publication> findPublicationByProjectId(UUID projectId) {
		return publicationRepository.findByProjectId(projectId);
	}
	
	@Transactional 
	public Publication createPublication(CreatePublicationRequest request) {
		Project project = projectRepository.findById(request.getProjectId()).orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + request.getProjectId()));
		Publication publication = Publication.builder()
                .project(project)
                .publicationDate(request.getPublicationDate())
                .publicationSource(request.getPublicationSource())
                .doiIsbn(request.getDoiIsbn())
                .startPage(request.getStartPage())
                .endPage(request.getEndPage())
                .journalVolume(request.getJournalVolume())
                .issueNumber(request.getIssueNumber())
                .build();
		
		return  publicationRepository.save(publication);
	}
	
	@Transactional 
	public PublicationDTO updatePublication(UUID id, PublicationDTO publicationDTO) {
		Publication existingPublication = publicationRepository.findByIdWithRelations(id).orElseThrow(() -> new ResourceNotFoundException("Publication not found with ID: " + id));
		publicationMapper.updatePublicationFromDto(publicationDTO, existingPublication);
		updateAuthors(existingPublication, publicationDTO.getAuthors().stream().map(ResponseUserDTO::getId).collect(Collectors.toList()));
		
		Publication updatedPublication = publicationRepository.save(existingPublication);
		return publicationMapper.toDTO(updatedPublication);
		}
	
	
	@Transactional 
	public PublicationAuthor addPublicationAuthor(UUID publicationId, Long userId) {
		Publication publication = getPublicationById(publicationId);
		User user =  getUserById(userId);
		
		if(publicationAuthorRepository.existsByPublicationAndUser(publication, user)) {
			throw new IllegalArgumentException("User is already an author of this publication");
		}
		
		PublicationAuthor publicationAuthor = new PublicationAuthor(publication, user);
		return publicationAuthorRepository.save(publicationAuthor);
	}
	
	@Transactional 
	public void removePublicationAuthor(UUID publicationId, Long userId) {
		Publication publication = getPublicationById(publicationId);
		User user = getUserById(userId);
		
		PublicationAuthor publicationAuthor = publicationAuthorRepository.findByPublicationAndUser(publication, user).orElseThrow(() -> new ResourceNotFoundException("This user is not an author of the publication"));
		
		publicationAuthorRepository.delete(publicationAuthor);
	}
	
	@Transactional 
	public void updatePublicationAuthors(UUID publicationId, List<Long> newAuthorIds) {
		Publication publication = publicationRepository.findById(publicationId).orElseThrow(() -> new RuntimeException("Publication not found with ID: " + publicationId));
		
		publicationAuthorRepository.deleteByPublication(publication);
		
		for(Long userId:newAuthorIds) {
			addPublicationAuthor(publicationId, userId);
		}
	}
	
	public Publication savePublication(Publication publication) {
		return publicationRepository.save(publication);
	}
	
	@Transactional 
	public void deleteProject(UUID id) {
		publicationRepository.deleteById(id);
	}
	
	public List<ResponseUserDTO> getPublicationAuthorsInfo(UUID publicationId) {
		Publication publication = getPublicationById(publicationId);
		return publicationAuthorRepository.getAuthorsInfoByPublication(publication);
	}
	
	public List<UUID> findProjectsByFilters(String source, String doiIsbn){
		Specification<Publication> spec = Specification.where(null);
		
		 if (source != null && !source.isEmpty()) {
		        spec = spec.and((root, query, cb) -> 
		            cb.like(cb.lower(root.get("publicationSource")), "%" + source.toLowerCase() + "%"));
		    }
		    
		    if (doiIsbn != null && !doiIsbn.isEmpty()) {
		        spec = spec.and((root, query, cb) -> 
		            cb.like(cb.lower(root.get("doiIsbn")), "%" + doiIsbn.toLowerCase() + "%"));
		    }
		    
		    return publicationRepository.findAll(spec)
		            .stream()
		            .map(p -> p.getProject().getId())
		            .distinct()
		            .collect(Collectors.toList());
		    }
	
	private User getUserById(Long id) {
		return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
	}
	
	private void addAuthorsToPublication(Publication publication, List<Long> authorIds) {
		authorIds.forEach(userId -> {
			User user = getUserById(userId);
			publication.addPublicationAuthor(new PublicationAuthor(publication, user));
		});
	}
	
	private void updateAuthors(Publication publication, List<Long> newAuthorIds) {
		publication.getPublicationAuthors().removeIf(pa -> !newAuthorIds.contains(pa.getUser().getId()));
		
		newAuthorIds.forEach(userId -> {
			if(publication.getPublicationAuthors().stream().noneMatch(pa -> pa.getUser().getId().equals(userId))) {
				User user = getUserById(userId);
				publication.addPublicationAuthor(new PublicationAuthor(publication, user));
			}
		});
	}
	
	 private Publication getPublicationById(UUID id) {
	        return publicationRepository.findById(id)
	                .orElseThrow(() -> new ResourceNotFoundException("Publication not found with ID: " + id));
	 }
}