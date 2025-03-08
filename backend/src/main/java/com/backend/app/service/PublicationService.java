package com.backend.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.app.dto.CreatePublicationRequest;
import com.backend.app.dto.ResponseUserDTO;
import com.backend.app.model.Project;
import com.backend.app.model.Publication;
import com.backend.app.model.PublicationAuthor;
import com.backend.app.model.User;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.PublicationAuthorRepository;
import com.backend.app.repository.PublicationRepository;
import com.backend.app.repository.UserRepository;

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
	
	public List<Publication> findAllPublications(){
		return publicationRepository.findAll();
	}
	
	public Optional<Publication> findPublicationById(UUID id) {
		return publicationRepository.findById(id);
	}
	
	public List<Publication> findPublicationByProjectId(UUID projectId) {
		return publicationRepository.findByProjectId(projectId);
	}
	
	@Transactional 
	public Optional<Publication> updatePublication(UUID id, Publication newPublication) {
		return publicationRepository.findById(id).map(existingPublication -> {
			existingPublication.setProject(newPublication.getProject());
			existingPublication.setPublicationSource(newPublication.getPublicationSource());
			existingPublication.setDoiIsbn(newPublication.getDoiIsbn());
			existingPublication.setStartPage(newPublication.getStartPage());
			existingPublication.setEndPage(newPublication.getEndPage());
			existingPublication.setJournalVolume(newPublication.getJournalVolume());
			existingPublication.setIssueNumber(newPublication.getIssueNumber());
		
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
}