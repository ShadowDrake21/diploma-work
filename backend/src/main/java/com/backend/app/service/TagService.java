package com.backend.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.app.dto.model.TagDTO;
import com.backend.app.mapper.TagMapper;
import com.backend.app.model.Tag;
import com.backend.app.repository.TagRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TagService {
	private final TagRepository tagRepository;
	private final TagMapper tagMapper;
	
	@Transactional(readOnly = true)
	public List<TagDTO> findAllTags(){
		log.debug("Fetching all tags");
		return tagRepository.findAll().stream().map(tagMapper::toDTO).collect(Collectors.toList());
	}
	
	@Transactional(readOnly = true)
	public Optional<TagDTO> findTagById(UUID id) {
        log.debug("Fetching tag by id: {}", id);
		return tagRepository.findById(id).map(tagMapper::toDTO);
	}
	
	public TagDTO createTag(TagDTO tagDTO) {
        log.debug("Creating new tag with name: {}", tagDTO.getName());
		Tag tag = tagMapper.toEntity(tagDTO);
		Tag savedTag = tagRepository.save(tag);
		return tagMapper.toDTO(savedTag);
	}
	
	public Optional<TagDTO> updateTag(UUID id, TagDTO tagDTO) {
        log.debug("Updating tag with id: {}", id);
		  return tagRepository.findById(id).map(existingTag -> {
	            existingTag.setName(tagDTO.getName());
	            Tag updatedTag = tagRepository.save(existingTag);
	            return tagMapper.toDTO(updatedTag);
	        });
	}
	
	public void deleteTag(UUID id) {
        log.debug("Deleting tag with id: {}", id);
		tagRepository.deleteById(id);
	}
}
