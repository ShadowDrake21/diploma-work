package com.backend.app.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.backend.app.dto.PatentDTO;
import com.backend.app.model.Patent;

@Mapper
public interface PatentMapper {
	PatentMapper INSTANCE = Mappers.getMapper(PatentMapper.class);
	
	PatentDTO toDTO(Patent patent);
	Patent toEntity(PatentDTO patentDTO);
}
