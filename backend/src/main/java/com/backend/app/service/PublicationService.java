package com.backend.app.service;

import java.util.ConcurrentModificationException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
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

	public List<Publication> findAllPublications() {
		return publicationRepository.findAll();
	}

	public PublicationDTO findPublicationById(UUID id) {
		return publicationRepository.findByIdWithRelations(id).map(publicationMapper::toDTO)
				.orElseThrow(() -> new ResourceNotFoundException("Publication not found with ID: " + id));
	}

	public List<Publication> findPublicationByProjectId(UUID projectId) {
		return publicationRepository.findByProjectId(projectId);
	}

	@Transactional
	public Publication createPublication(CreatePublicationRequest request) {
		try {
			Project project = projectRepository.findById(request.getProjectId()).orElseThrow(
					() -> new ResourceNotFoundException("Project not found with ID: " + request.getProjectId()));
			
			Publication publication = new Publication();
			publication.setProject(project);
			publication.setPublicationDate(request.getPublicationDate());
			publication.setPublicationSource(request.getPublicationSource());
			publication.setDoiIsbn(request.getDoiIsbn());
			publication.setStartPage(request.getStartPage());
			publication.setEndPage(request.getEndPage());
			publication.setJournalVolume(request.getJournalVolume());
			publication.setIssueNumber(request.getIssueNumber());
			
			Publication savedPublication = publicationRepository.save(publication);
			
			if(request.getAuthors() != null && !request.getAuthors().isEmpty()) {
				addAuthorsToPublication(savedPublication, request.getAuthors());
			}
			
			return savedPublication;

		} catch (Exception e) {
			log.error("Error creating publication: {}", e.getMessage(), e);
			throw new RuntimeException("Failed to create publication", e);
		}
	}

	@Transactional
	public PublicationDTO updatePublication(UUID id, PublicationDTO publicationDTO) {
		try {
			Publication existingPublication = publicationRepository.findByIdWithRelations(id)
					.orElseThrow(() -> new ResourceNotFoundException("Publication not found with ID: " + id));
			
			if(publicationDTO.getProjectId() == null) {
				publicationDTO.setProjectId(existingPublication.getProject().getId());
			}
			
			publicationMapper.updatePublicationFromDto(publicationDTO, existingPublication);
			
			if(publicationDTO.getAuthors() != null) {
			updateAuthors(existingPublication,
					publicationDTO.getAuthors().stream().map(ResponseUserDTO::getId).collect(Collectors.toList()));
			}
			
			Publication updatedPublication = publicationRepository.save(existingPublication);
			return publicationMapper.toDTO(updatedPublication);
		} catch (ObjectOptimisticLockingFailureException e) {
			throw new ConcurrentModificationException("The publication was modified by another transaction. Please refresh and try again.");
		}
		
	}

	@Transactional
	public PublicationAuthor addPublicationAuthor(UUID publicationId, Long userId) {
		Publication publication = getPublicationById(publicationId);
		User user = getUserById(userId);

		if (publicationAuthorRepository.existsByPublicationAndUser(publication, user)) {
			throw new IllegalArgumentException("User is already an author of this publication");
		}

		PublicationAuthor publicationAuthor = new PublicationAuthor(publication, user);
		return publicationAuthorRepository.save(publicationAuthor);
	}

	@Transactional
	public void removePublicationAuthor(UUID publicationId, Long userId) {
		Publication publication = getPublicationById(publicationId);
		User user = getUserById(userId);

		PublicationAuthor publicationAuthor = publicationAuthorRepository.findByPublicationAndUser(publication, user)
				.orElseThrow(() -> new ResourceNotFoundException("This user is not an author of the publication"));

		publicationAuthorRepository.delete(publicationAuthor);
	}

	@Transactional
	public void updatePublicationAuthors(UUID publicationId, List<Long> newAuthorIds) {
		Publication publication = publicationRepository.findById(publicationId)
				.orElseThrow(() -> new RuntimeException("Publication not found with ID: " + publicationId));
		
		List<PublicationAuthor> currentAuthors = publicationAuthorRepository.findByPublication(publication);
		
		try {
			currentAuthors.forEach(author -> {
				publicationAuthorRepository.delete(author);
			});
		}  catch (ObjectOptimisticLockingFailureException e) {
	        throw new ConcurrentModificationException(
	                "Authors were modified by another transaction. Please refresh and try again.");
	        }
		publication.getPublicationAuthors().clear();
		
		if(newAuthorIds != null) {
			newAuthorIds.forEach(userId -> {
				User user = getUserById(userId);
				PublicationAuthor author = new PublicationAuthor(publication, user);
				publicationAuthorRepository.save(author);
				publication.addPublicationAuthor(author);
			});
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

	public List<UUID> findProjectsByFilters(String source, String doiIsbn) {
		Specification<Publication> spec = Specification.where(null);

		if (source != null && !source.isEmpty()) {
			spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("publicationSource")),
					"%" + source.toLowerCase() + "%"));
		}

		if (doiIsbn != null && !doiIsbn.isEmpty()) {
			spec = spec.and(
					(root, query, cb) -> cb.like(cb.lower(root.get("doiIsbn")), "%" + doiIsbn.toLowerCase() + "%"));
		}

		return publicationRepository.findAll(spec).stream().map(p -> p.getProject().getId()).distinct()
				.collect(Collectors.toList());
	}

	private User getUserById(Long id) {
		return userRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
	}

	private void addAuthorsToPublication(Publication publication, List<Long> authorIds) {
		authorIds.forEach(userId -> {
			User user = getUserById(userId);
			publication.addPublicationAuthor(new PublicationAuthor(publication, user));
		});
	}

	private void updateAuthors(Publication publication, List<Long> newAuthorIds) {
//		 if (newAuthorIds == null) {
//        return; 
//    }
//		publicationAuthorRepository.deleteByPublication(publication);
//		
//		publication.getPublicationAuthors().clear();
//		
//		if(newAuthorIds != null) {
//			newAuthorIds.forEach(userId -> {
//				User user = getUserById(userId);
//				PublicationAuthor author = new PublicationAuthor(publication, user);
//				publicationAuthorRepository.save(author);
//				publication.addPublicationAuthor(author);
//			});
//		}
		 if (newAuthorIds == null) {
		        return; 
		    }
		 
		 Set<Long> currentAuthorIds = publication.getPublicationAuthors().stream().map(pa -> pa.getUser().getId()).collect(Collectors.toSet());
		 
		publication.getPublicationAuthors().removeIf(pa -> !newAuthorIds.contains(pa.getUser().getId()));

		newAuthorIds.stream().filter(userId -> !currentAuthorIds.contains(userId)).forEach(userId -> {
			User user = getUserById(userId);
			PublicationAuthor author = new PublicationAuthor(publication, user);
			publicationAuthorRepository.save(author);
			publication.addPublicationAuthor(author);
		});
	}

	private Publication getPublicationById(UUID id) {
		return publicationRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Publication not found with ID: " + id));
	}
}