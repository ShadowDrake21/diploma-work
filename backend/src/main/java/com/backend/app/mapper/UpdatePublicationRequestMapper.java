package com.backend.app.mapper;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.backend.app.dto.miscellaneous.ResponseUserDTO;
import com.backend.app.dto.model.PublicationDTO;
import com.backend.app.dto.request.UpdatePublicationRequest;
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
		Publication existing = getExistingPublication(publicationId);

		PublicationDTO dto = new PublicationDTO();
		mapProjectId(request, existing, dto);
		mapPublicationDatesAndSources(request, existing, dto);
		mapPages(request, dto);
		mapJournalDetails(request, existing, dto);
		mapAuthors(request, existing, dto);

		return dto;
	}

	private Publication getExistingPublication(UUID publicationId) {
		return publicationRepository.findById(publicationId)
				.orElseThrow(() -> new ResourceNotFoundException("Publication not found"));
	}

	private void mapProjectId(UpdatePublicationRequest request, Publication existing, PublicationDTO dto) {
		UUID projectId = (request.getProject() != null) ? request.getProject().getId() : existing.getProject().getId();
		dto.setProjectId(projectId);
	}

	private void mapPublicationDatesAndSources(UpdatePublicationRequest request, Publication existing,
			PublicationDTO dto) {
		dto.setPublicationDate(getNonNullOrDefault(request.getPublicationDate(), existing.getPublicationDate()));

		dto.setPublicationSource(getNonNullOrDefault(request.getPublicationSource(), existing.getPublicationSource()));

		dto.setDoiIsbn(getNonNullOrDefault(request.getDoiIsbn(), existing.getDoiIsbn()));
	}

	private void mapPages(UpdatePublicationRequest request, PublicationDTO dto) {
		dto.setStartPage(request.getStartPage());
		dto.setEndPage(request.getEndPage());
	}

	private void mapJournalDetails(UpdatePublicationRequest request, Publication existing, PublicationDTO dto) {
		dto.setJournalVolume(getNonZeroOrDefault(request.getJournalVolume(), existing.getJournalVolume()));

		dto.setIssueNumber(getNonZeroOrDefault(request.getIssueNumber(), existing.getIssueNumber()));
	}

	private void mapAuthors(UpdatePublicationRequest request, Publication existing, PublicationDTO dto) {
		List<ResponseUserDTO> authors = (request.getAuthors() != null) ? mapRequestAuthors(request)
				: mapExistingAuthors(existing);
		dto.setAuthors(authors);
	}

	private List<ResponseUserDTO> mapRequestAuthors(UpdatePublicationRequest request) {
		return request.getAuthors().stream().map(authorId -> new ResponseUserDTO(authorId, null))
				.collect(Collectors.toList());
	}

	private List<ResponseUserDTO> mapExistingAuthors(Publication existing) {
		return existing.getPublicationAuthors().stream().map(this::toResponseUserDTO).collect(Collectors.toList());
	}

	private ResponseUserDTO toResponseUserDTO(PublicationAuthor author) {
		return new ResponseUserDTO(author.getUser().getId(), author.getUser().getUsername());
	}

	private <T> T getNonNullOrDefault(T newValue, T defaultValue) {
		return newValue != null ? newValue : defaultValue;
	}

	private int getNonZeroOrDefault(int newValue, int defaultValue) {
		return newValue != 0 ? newValue : defaultValue;
	}
}
