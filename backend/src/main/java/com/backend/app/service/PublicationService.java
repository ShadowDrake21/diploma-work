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
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@Service
public class PublicationService {
	@Autowired
	private PublicationRepository publicationRepository;
	
	@Autowired
	private ProjectRepository projectRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private PublicationAuthorRepository publicationAuthorRepository;
	
	@Autowired
	private PublicationMapper publicationMapper;
	
    @PersistenceContext
	private EntityManager entityManager;
	
	public List<Publication> findAllPublications(){
		return publicationRepository.findAll();
	}
	
	public PublicationDTO findPublicationById(UUID id) {
		Publication publication = publicationRepository.findByIdWithRelations(id).orElseThrow(() -> new EntityNotFoundException("Publication not found"));
	    return publicationMapper.toDTO(publication);
	}
	
	public List<Publication> findPublicationByProjectId(UUID projectId) {
		return publicationRepository.findByProjectId(projectId);
	}
	
	@Transactional 
	public Optional<Publication> updatePublication(UUID id, Publication newPublication) {
		System.out.println("Updating publication with ID: " + id);
	    System.out.println("Project: " + newPublication.getProject());
	    System.out.println("Publication authors: " + newPublication.getPublicationAuthors().size());
	    return publicationRepository.findById(id).map(existingPublication -> {
			if (newPublication.getProject() == null) {
	            throw new IllegalArgumentException("Project cannot be null");
	        }
			existingPublication.setProject(newPublication.getProject());
			existingPublication.setPublicationSource(newPublication.getPublicationSource());
			existingPublication.setDoiIsbn(newPublication.getDoiIsbn());
			existingPublication.setStartPage(newPublication.getStartPage());
			existingPublication.setEndPage(newPublication.getEndPage());
			existingPublication.setJournalVolume(newPublication.getJournalVolume());
			existingPublication.setIssueNumber(newPublication.getIssueNumber());
			
	        System.out.println("Clearing existing authors...");
			existingPublication.getPublicationAuthors().clear();
			
			entityManager.flush();
			for(PublicationAuthor author : newPublication.getPublicationAuthors()) {
				author.setPublication(newPublication);
				existingPublication.addPublicationAuthor(author);
			}
		
			return publicationRepository.save(existingPublication);
		});
}
	@Transactional 
	public Publication createPublication(CreatePublicationRequest request) {
		Project project = projectRepository.findById(request.getProjectId()).orElseThrow(() -> new RuntimeException("Project not found with ID: " + request.getProjectId()));
		Publication publication = new Publication(
				project, request.getPublicationDate(),
				request.getPublicationSource(), 
				request.getDoiIsbn(), 
				request.getStartPage(), 
				request.getEndPage(), 
				request.getJournalVolume(),
				request.getIssueNumber()
				);
		
		
		for(Long userId : request.getAuthors()) {
			User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
			PublicationAuthor publicationAuthor = new PublicationAuthor();
			publicationAuthor.setPublication(publication);
			publicationAuthor.setUser(user);
			
			publication.addPublicationAuthor(publicationAuthor);

		}
		
		return  publicationRepository.save(publication);
	}
	
	@Transactional 
	public PublicationAuthor addPublicationAuthor(UUID publicationId, Long userId) {
		Publication publication = publicationRepository.findById(publicationId).orElseThrow(() -> new RuntimeException("Publication not found with ID: " + publicationId));
		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
		
		if(publicationAuthorRepository.existsByPublicationAndUser(publication, user)) {
			throw new RuntimeException("User is already an author of this publication");
		}
		
		PublicationAuthor publicationAuthor = new PublicationAuthor();
		publicationAuthor.setPublication(publication);
		publicationAuthor.setUser(user);
		
		return publicationAuthorRepository.save(publicationAuthor);
	}
	
	@Transactional 
	public void removePublicationAuthor(UUID publicationId, Long userId) {
		Publication publication = publicationRepository.findById(publicationId).orElseThrow(() -> new RuntimeException("Publication not found with ID: " + publicationId));
		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
		PublicationAuthor publicationAuthor = publicationAuthorRepository.findByPublicationAndUser(publication, user).orElseThrow(() -> new RuntimeException("This user is not an author of the publication"));
		
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
		System.out.println("getPublicationAuthorsInfo " + publicationId);
		Publication publication = publicationRepository.findById(publicationId) .orElseThrow(() -> new RuntimeException("Publication not found with ID: " + publicationId));
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
	
}