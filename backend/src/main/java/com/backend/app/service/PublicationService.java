package com.backend.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.app.dto.CreatePublicationRequest;
import com.backend.app.model.Project;
import com.backend.app.model.Publication;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.PublicationRepository;

@Service
public class PublicationService {
	@Autowired
	private PublicationRepository publicationRepository;
	
	@Autowired
	private ProjectRepository projectRepository;
	
	public List<Publication> findAllPublications(){
		return publicationRepository.findAll();
	}
	
	public Optional<Publication> findPublicationById(UUID id) {
		return publicationRepository.findById(id);
	}
	
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
	
	public Publication createPublication(CreatePublicationRequest request) {
		Project project = projectRepository.findById(request.getProjectId()).orElseThrow(() -> new RuntimeException("Project not found with ID: " + request.getProjectId()));
		
		Publication publication = new Publication(
				project, request.getPublicationSource(), request.getDoiIsbn(), request.getStartPage(), request.getEndPage(), request.getJournalVolume(), request.getIssueNumber()
				);
		
		return publicationRepository.save(publication);
	}
	
	public Publication savePublication(Publication publication) {
		return publicationRepository.save(publication);
	}
	
	public void deleteProject(UUID id) {
		publicationRepository.deleteById(id);
	}
}