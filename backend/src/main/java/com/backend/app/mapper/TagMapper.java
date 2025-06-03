package com.backend.app.mapper;

import java.util.Objects;

import org.springframework.stereotype.Component;

import com.backend.app.dto.model.TagDTO;
import com.backend.app.model.Tag;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class TagMapper {
	public TagDTO toDTO(Tag tag) {
		log.debug("Converting Tag to DTO: {}", tag);
		if (Objects.isNull(tag)) {
			return null;
		}

		return TagDTO.builder().id(tag.getId()).name(tag.getName()).build();
	}

	public Tag toEntity(TagDTO tagDTO) {
		log.debug("Converting DTO to Tag: {}", tagDTO);
		if (Objects.isNull(tagDTO)) {
			return null;
		}

		return Tag.builder().id(tagDTO.getId()).name(tagDTO.getName()).build();
	}

	public void updateEntityFromDTO(TagDTO tagDTO, Tag tag) {
		log.debug("Updating Tag from DTO: {}", tagDTO);
		if (Objects.nonNull(tagDTO) && Objects.nonNull(tag)) {
			tag.setName(tagDTO.getName());
		}
	}
}
