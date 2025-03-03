package com.backend.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.app.dto.TagDTO;
import com.backend.app.mapper.TagMapper;
import com.backend.app.model.Tag;
import com.backend.app.repository.TagRepository;

@Service
public class TagService {
	@Autowired
	private TagRepository tagRepository;
	
	@Autowired
	private TagMapper tagMapper;
	
	public List<TagDTO> findAllTags(){
		return tagRepository.findAll().stream().map(tagMapper::toDTO).collect(Collectors.toList());
	}
	
	public Optional<TagDTO> findTagById(UUID id) {
		return tagRepository.findById(id).map(tagMapper::toDTO);
	}
	
	public TagDTO createTag(TagDTO tagDTO) {
		Tag tag = tagMapper.toEntity(tagDTO);
		Tag savedTag = tagRepository.save(tag);
		return tagMapper.toDTO(savedTag);
	}
	
	public Optional<TagDTO> updateTag(UUID id, TagDTO tagDTO) {
		  return tagRepository.findById(id).map(existingTag -> {
	            existingTag.setName(tagDTO.getName());
	            Tag updatedTag = tagRepository.save(existingTag);
	            return tagMapper.toDTO(updatedTag);
	        });
	}
	
	public void deleteTag(UUID id) {
		tagRepository.deleteById(id);
	}
}
