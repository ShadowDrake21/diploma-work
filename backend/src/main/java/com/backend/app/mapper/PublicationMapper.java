package com.backend.app.mapper;

import com.backend.app.dto.PublicationDTO;
import com.backend.app.model.Publication;

public class PublicationMapper {

    // Manually mapping Publication to PublicationDTO
    public PublicationDTO toDTO(Publication publication) {
        if (publication == null) {
            return null;
        }
        PublicationDTO publicationDTO = new PublicationDTO();
        // Copy the properties
        publicationDTO.setId(publication.getId());
        publicationDTO.setTitle(publication.getTitle());
        publicationDTO.setContent(publication.getContent());
        // Add any other fields you need to map
        return publicationDTO;
    }

    // Manually mapping PublicationDTO to Publication
    public Publication toEntity(PublicationDTO publicationDTO) {
        if (publicationDTO == null) {
            return null;
        }
        Publication publication = new Publication();
        // Copy the properties
        publication.setId(publicationDTO.getId());
        publication.setTitle(publicationDTO.getTitle());
        publication.setContent(publicationDTO.getContent());
        // Add any other fields you need to map
        return publication;
    }
}
