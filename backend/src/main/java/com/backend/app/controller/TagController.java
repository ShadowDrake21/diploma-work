package com.backend.app.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.model.TagDTO;
import com.backend.app.dto.response.ApiResponse;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.service.TagService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tags")
public class TagController {
	private final TagService tagService;
	
	@GetMapping
	public ResponseEntity<ApiResponse<List<TagDTO>>> getAllTags() {
		log.info("Fetching all tags");
		List<TagDTO> tags = tagService.findAllTags();
        return ResponseEntity.ok(ApiResponse.success(tags));
 	}
	
	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<TagDTO>> getTagById(@PathVariable UUID id) {
        log.info("Fetching tag with id: {}", id);
        TagDTO tag = tagService.findTagById(id).orElseThrow(() -> new ResourceNotFoundException("Tag not found with ID: " + id));
		return ResponseEntity.ok(ApiResponse.success(tag));
	}
	
	@PostMapping
	public ResponseEntity<ApiResponse<TagDTO>> createTag(@RequestBody TagDTO tagDTO){
		log.info("Creating new tag: {}", tagDTO);
		TagDTO createTag = tagService.createTag(tagDTO);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(createTag));
	}
	
	@PostMapping("/{id}")
	public ResponseEntity<ApiResponse<TagDTO>> updateTag(@PathVariable UUID id, @RequestBody TagDTO tagDTO) {
        log.info("Updating tag with id {}: {}", id, tagDTO);
        TagDTO updatedTag = tagService.updateTag(id, tagDTO).orElseThrow(() -> new ResourceNotFoundException("Tag not found with ID: " + id));
		return ResponseEntity.ok(ApiResponse.success(updatedTag));
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteTag(@PathVariable UUID id) {
		log.info("Deleting tag with id: {}", id);
		tagService.deleteTag(id);
		 return ResponseEntity
	                .status(HttpStatus.OK)
	                .body(ApiResponse.success(null));
	}
}
