package com.backend.app.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.TagDTO;
import com.backend.app.model.Tag;
import com.backend.app.service.TagService;

@RestController
@RequestMapping("/api/tags")
public class TagController {
	@Autowired
	private TagService tagService;
	
	@GetMapping
	public List<TagDTO> getAllTags() {
		return tagService.findAllTags();
	}
	
	@GetMapping("/{id}")
	public TagDTO getTagById(@PathVariable UUID id) {
		return tagService.findTagById(id).orElseThrow(() -> new RuntimeException("Tag not found with ID: " + id));
	}
	
	@PostMapping
	public ResponseEntity<TagDTO> createTag(@RequestBody TagDTO tagDTO){
		TagDTO createTag = tagService.createTag(tagDTO);
		return ResponseEntity.status(HttpStatus.CREATED).body(createTag);
	}
	
	@PostMapping("/{id}")
	public TagDTO updateTag(@PathVariable UUID id, @RequestBody TagDTO tagDTO) {
		return tagService.updateTag(id, tagDTO).orElseThrow(() -> new RuntimeException("Tag not found with ID: " + id));
	}
	
	@DeleteMapping("/{id}")
	public void deleteTag(@PathVariable UUID id) {
		tagService.deleteTag(id);
	}
}
