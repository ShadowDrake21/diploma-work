package com.backend.app.mapper;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.backend.app.dto.PublicationDTO;
import com.backend.app.dto.ResponseUserDTO;
import com.backend.app.dto.UpdatePublicationRequest;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UpdatePublicationRequestMapper {
	public PublicationDTO toPublicationDTO(UpdatePublicationRequest request, UUID publicationId) {
		PublicationDTO dto = new PublicationDTO();
		 dto.setId(publicationId);
	        dto.setProjectId(request.getProject().getId());
	        dto.setPublicationDate(request.getPublicationDate());
	        dto.setPublicationSource(request.getPublicationSource());
	        dto.setDoiIsbn(request.getDoiIsbn());
	        dto.setStartPage(request.getStartPage());
	        dto.setEndPage(request.getEndPage());
	        dto.setJournalVolume(request.getJournalVolume());
	        dto.setIssueNumber(request.getIssueNumber());
	        
	      if(request.getPublicationAuthors() != null) {
	    	  List<ResponseUserDTO> authors = request.getPublicationAuthors().stream().map(a -> new ResponseUserDTO(a.getUser().getId(), null)).collect(Collectors.toList());
	    	  dto.setAuthors(authors);
	      }
	      
	      return dto;
	}
}
