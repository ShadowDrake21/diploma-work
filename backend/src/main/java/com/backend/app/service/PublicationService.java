package com.backend.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.app.model.Publication;
import com.backend.app.repository.PublicationRepository;

@Service
public class PublicationService {
	@Autowired
	private PublicationRepository publicationRepository;
	
	public List<Publication> findAllPublications(){
		return publicationRepository.findAll();
	}
	
	public Optional<Publication> findPublicationById(UUID id) {
		return publicationRepository.findById(id);
	}
	
	public Publication savePublication(Publication publication) {
		return publicationRepository.save(publication);
	}
	
	public void deleteProject(UUID id) {
		publicationRepository.deleteById(id);
	}
}
