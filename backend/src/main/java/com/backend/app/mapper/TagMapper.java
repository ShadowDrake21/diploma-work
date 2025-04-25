package com.backend.app.mapper;

import org.springframework.stereotype.Component;

import com.backend.app.dto.TagDTO;
import com.backend.app.model.Tag;

@Component
public class TagMapper {
	public TagDTO toDTO(Tag tag) {
		if(tag == null) {
			return null;
		}
		
		TagDTO tagDTO = new TagDTO();
		tagDTO.setId(tag.getId());
		tagDTO.setName(tag.getName());
		return tagDTO;
	}
	
	public Tag toEntity(TagDTO tagDTO) {
		if(tagDTO == null) {
			return null;
		}
		
		Tag tag = new Tag();
		 tag.setId(tagDTO.getId());
	        tag.setName(tagDTO.getName());
	        return tag;
	}
}
