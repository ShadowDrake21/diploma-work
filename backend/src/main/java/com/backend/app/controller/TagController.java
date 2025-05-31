package com.backend.app.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.controller.codes.TagCodes;
import com.backend.app.controller.messages.TagMessages;
import com.backend.app.dto.model.TagDTO;
import com.backend.app.dto.response.ApiResponse;
import com.backend.app.exception.BusinessRuleException;
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
	
	@Cacheable("tags") // !!!!!
	@GetMapping
	public ResponseEntity<ApiResponse<List<TagDTO>>> getAllTags() {
		 try {
	            log.info("Fetching all tags");
	            List<TagDTO> tags = tagService.findAllTags();
	            return ResponseEntity.ok(ApiResponse.success(
	                tags,
	                TagMessages.getMessage(TagCodes.TAGS_FETCHED),TagCodes.TAGS_FETCHED
	            ));
	        } catch (Exception e) {
	            log.error("Error fetching all tags: ", e);
	            return ResponseEntity.internalServerError()
	                .body(ApiResponse.error(
	                    TagMessages.getMessage(TagCodes.SERVER_ERROR),
	                    TagCodes.SERVER_ERROR
	                ));
	        }
 	}
	
	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<TagDTO>> getTagById(@PathVariable UUID id) {
		try {
            log.info("Fetching tag with id: {}", id);
            TagDTO tag = tagService.findTagById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    TagMessages.getMessage(TagCodes.TAG_NOT_FOUND)
                ));
            return ResponseEntity.ok(ApiResponse.success(
                tag,
                TagMessages.getMessage(TagCodes.TAG_FETCHED), TagCodes.TAG_FETCHED
            ));
        } catch (ResourceNotFoundException e) {
            log.warn("Tag not found with id: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(
                    e.getMessage(),
                    TagCodes.TAG_NOT_FOUND
                ));
        } catch (Exception e) {
            log.error("Error fetching tag with id {}: ", id, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(
                    TagMessages.getMessage(TagCodes.SERVER_ERROR),
                    TagCodes.SERVER_ERROR
                ));
        }
	}
	
	@CacheEvict(value = "tags", allEntries = true) //!!!!
	@PostMapping
	public ResponseEntity<ApiResponse<TagDTO>> createTag(@RequestBody TagDTO tagDTO){
		try {
            log.info("Creating new tag: {}", tagDTO);
            TagDTO createdTag = tagService.createTag(tagDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                    createdTag,
                    TagMessages.getMessage(TagCodes.TAG_CREATED),TagCodes.TAG_CREATED
                ));
        } catch (BusinessRuleException e) {
            log.warn("Business rule violation creating tag: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(
                    e.getMessage(),
                    TagCodes.TAG_VALIDATION_ERROR
                ));
        } catch (Exception e) {
            log.error("Error creating tag: ", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(
                    TagMessages.getMessage(TagCodes.SERVER_ERROR),
                    TagCodes.SERVER_ERROR
                ));
        }
	}
	
	@PostMapping("/{id}")
	public ResponseEntity<ApiResponse<TagDTO>> updateTag(@PathVariable UUID id, @RequestBody TagDTO tagDTO) {
		 try {
	            log.info("Updating tag with id {}: {}", id, tagDTO);
	            TagDTO updatedTag = tagService.updateTag(id, tagDTO)
	                .orElseThrow(() -> new ResourceNotFoundException(
	                    TagMessages.getMessage(TagCodes.TAG_NOT_FOUND)
	                ));
	            return ResponseEntity.ok(ApiResponse.success(
	                updatedTag,
	                TagMessages.getMessage(TagCodes.TAG_UPDATED),TagCodes.TAG_UPDATED
	            ));
	        } catch (ResourceNotFoundException e) {
	            log.warn("Tag not found for update with id: {}", id);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                .body(ApiResponse.error(
	                    e.getMessage(),
	                    TagCodes.TAG_NOT_FOUND
	                ));
	        } catch (BusinessRuleException e) {
	            log.warn("Business rule violation updating tag: {}", e.getMessage());
	            return ResponseEntity.badRequest()
	                .body(ApiResponse.error(
	                    e.getMessage(),
	                    TagCodes.TAG_VALIDATION_ERROR
	                ));
	        } catch (Exception e) {
	            log.error("Error updating tag with id {}: ", id, e);
	            return ResponseEntity.internalServerError()
	                .body(ApiResponse.error(
	                    TagMessages.getMessage(TagCodes.SERVER_ERROR),
	                    TagCodes.SERVER_ERROR
	                ));
	        }
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteTag(@PathVariable UUID id) {
		try {
            log.info("Deleting tag with id: {}", id);
            tagService.deleteTag(id);
            return ResponseEntity.ok(ApiResponse.success(
                null,
                TagMessages.getMessage(TagCodes.TAG_DELETED),TagCodes.TAG_DELETED
            ));
        } catch (ResourceNotFoundException e) {
            log.warn("Tag not found for deletion with id: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(
                    e.getMessage(),
                    TagCodes.TAG_NOT_FOUND
                ));
        } catch (Exception e) {
            log.error("Error deleting tag with id {}: ", id, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(
                    TagMessages.getMessage(TagCodes.SERVER_ERROR),
                    TagCodes.SERVER_ERROR
                ));
        }
    }
}
