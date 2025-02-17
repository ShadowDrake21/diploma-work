package com.backend.app.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.backend.app.dto.PublicationDTO;
import com.backend.app.model.Publication;

@Mapper
public interface PublicationMapper {
	PublicationMapper INSTANCE = Mappers.getMapper(PublicationMapper.class);
	
	PublicationDTO toDTO(Publication publication);
	Publication toEntity(PublicationDTO publicationDTO);
}
