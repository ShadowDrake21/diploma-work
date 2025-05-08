package com.backend.app.mapper;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.backend.app.dto.PublicationDTO;
import com.backend.app.dto.ResponseUserDTO;
import com.backend.app.dto.UpdatePublicationRequest;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.model.Publication;
import com.backend.app.model.PublicationAuthor;
import com.backend.app.repository.PublicationRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UpdatePublicationRequestMapper {
	private final PublicationRepository publicationRepository;

	public PublicationDTO toPublicationDTO(UpdatePublicationRequest request, UUID publicationId) {
		Publication existing = publicationRepository.findById(publicationId)
				.orElseThrow(() -> new ResourceNotFoundException("Publication not found"));

		PublicationDTO dto = new PublicationDTO();
		dto.setProjectId(request.getProject() != null ? request.getProject().getId() : existing.getProject().getId());

		dto.setPublicationDate(
				request.getPublicationDate() != null ? request.getPublicationDate() : existing.getPublicationDate());

		dto.setPublicationSource(request.getPublicationSource() != null ? request.getPublicationSource()
				: existing.getPublicationSource());

		dto.setPublicationDate(
				request.getPublicationDate() != null ? request.getPublicationDate() : existing.getPublicationDate());

		dto.setPublicationSource(request.getPublicationSource() != null ? request.getPublicationSource()
				: existing.getPublicationSource());

		dto.setStartPage(request.getStartPage());
		dto.setEndPage(request.getEndPage());

		dto.setPublicationDate(
				request.getPublicationDate() != null ? request.getPublicationDate() : existing.getPublicationDate());

		dto.setJournalVolume(
				request.getJournalVolume() != 0 ? request.getJournalVolume() : existing.getJournalVolume());

		dto.setIssueNumber(request.getIssueNumber() != 0 ? request.getIssueNumber() : existing.getIssueNumber());

		if (request.getAuthors() != null) {
            dto.setAuthors(request.getAuthors().stream()
                    .map(a -> new ResponseUserDTO(a, null))
                    .collect(Collectors.toList()));
        } else {
            // Only use existing authors if request didn't specify any
            dto.setAuthors(existing.getPublicationAuthors().stream()
                    .map(a -> new ResponseUserDTO(a.getUser().getId(), a.getUser().getUsername()))
                    .collect(Collectors.toList()));
        }

		return dto;
	}
	
	private List<ResponseUserDTO> mapAuthors(List<PublicationAuthor> authors) {
		if (authors == null) {
			return Collections.emptyList();
			
		}
		return authors.stream().map(a -> new ResponseUserDTO(a.getUser().getId(), a.getUser().getUsername())).collect(Collectors.toList());
	}
}
