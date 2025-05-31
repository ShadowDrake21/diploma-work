package com.backend.app.controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.backend.app.controller.codes.PatentCodes;
import com.backend.app.controller.messages.PatentMessages;
import com.backend.app.dto.create.CreatePatentRequest;
import com.backend.app.dto.model.PatentDTO;
import com.backend.app.dto.response.ApiResponse;
import com.backend.app.exception.BusinessRuleException;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.mapper.PatentMapper;
import com.backend.app.model.Patent;
import com.backend.app.service.PatentService;

import jakarta.validation.Valid;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for managing patents
 */
@Slf4j
@RestController
@RequestMapping("/api/patents")
@RequiredArgsConstructor
public class PatentController {
	private final PatentService patentService;
    private final PatentMapper patentMapper;
	
    /**
     * Get all patents
     * @return List of PatentDTO
     */
	@GetMapping
	public ResponseEntity<ApiResponse<List<PatentDTO>>> getAllPatents(){
		try {
			
			log.info("Fetching all patents");
			List<PatentDTO> patents = patentService.findAllPatents().stream().map(patentMapper::toDTO).collect(Collectors.toList());
			return ResponseEntity.ok(ApiResponse.success(patents, PatentMessages.getMessage(PatentCodes.PATENTS_FETCHED),PatentCodes.PATENTS_FETCHED));
		} catch (Exception e) {
            log.error("Error fetching patents: ", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(
                    PatentMessages.getMessage(PatentCodes.SERVER_ERROR),
                    PatentCodes.SERVER_ERROR
                ));
        }
	}
	
	
	/**
     * Get a patent by ID
     * @param id Patent ID
     * @return PatentDTO
     */
	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<PatentDTO>> getPatentById(@PathVariable UUID id) {
       try {
    	   log.info("Fetching patent with id: {}", id);
   		PatentDTO patent = patentService.findPatentById(id)
   				.map(patentMapper::toDTO)
   				 .orElseThrow(() -> new ResourceNotFoundException(
   		                    PatentMessages.getMessage(PatentCodes.PATENT_NOT_FOUND)
   		                ));
   	 return ResponseEntity.ok(ApiResponse.success(
             patent,
             PatentMessages.getMessage(PatentCodes.PATENT_FETCHED), PatentCodes.PATENT_FETCHED
         ));
	}catch (ResourceNotFoundException e) {
        log.warn("Patent not found with id: {}", id);
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(
                e.getMessage(),
                PatentCodes.PATENT_NOT_FOUND
            ));
    } catch (Exception e) {
        log.error("Error fetching patent with id {}: {}", id, e.getMessage());
        return ResponseEntity.internalServerError()
            .body(ApiResponse.error(
                PatentMessages.getMessage(PatentCodes.SERVER_ERROR),
                PatentCodes.SERVER_ERROR
            ));
    }
	}
	
	 /**
     * Create a new patent
     * @param request CreatePatentRequest
     * @return Created PatentDTO
     */
	@PostMapping
	public ResponseEntity<ApiResponse<PatentDTO>> createPatent(@Valid @RequestBody CreatePatentRequest request) {
		
		try {
			log.info("Creating new patent for project: {}", request.getProjectId());
			Patent patent = patentService.createPatent(request);
			PatentDTO result = patentMapper.toDTO(patent);
			return ResponseEntity.status(HttpStatus.CREATED)
	                .body(ApiResponse.success(
	                    result,
	                    PatentMessages.getMessage(PatentCodes.PATENT_CREATED)
	                ));
		}catch (ResourceNotFoundException e) {
            log.warn("Resource not found while creating patent: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(
                    e.getMessage(),
                    PatentCodes.RESOURCE_NOT_FOUND
                ));
        } catch (ValidationException e) {
            log.warn("Validation error while creating patent: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(
                    e.getMessage(),
                    PatentCodes.VALIDATION_ERROR
                ));
        } catch (Exception e) {
            log.error("Error creating patent: ", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(
                    PatentMessages.getMessage(PatentCodes.SERVER_ERROR),
                    PatentCodes.SERVER_ERROR
                ));
        }
	}
	
	/**
     * Update an existing patent
     * @param id Patent ID
     * @param patentDTO PatentDTO with updates
     * @return Updated PatentDTO
     */
	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<PatentDTO>> updatePatent(@PathVariable UUID id, @Valid @RequestBody PatentDTO patentDTO) {
		try {
            log.info("Updating patent with id: {}", id);
            
            if (!id.equals(patentDTO.getId())) {
                throw new BusinessRuleException(
                    PatentMessages.getMessage(PatentCodes.ID_MISMATCH)
                );
            }
            
            Patent patent = patentMapper.toEntity(patentDTO);
            PatentDTO updatedPatent = patentService.updatePatent(id, patent)
                .map(patentMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException(
                    PatentMessages.getMessage(PatentCodes.PATENT_NOT_FOUND)
                ));
            
            return ResponseEntity.ok(ApiResponse.success(
                updatedPatent,
                PatentMessages.getMessage(PatentCodes.PATENT_UPDATED)
            ));
        } catch (ResourceNotFoundException e) {
            log.warn("Patent not found for update with id: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(
                    e.getMessage(),
                    PatentCodes.PATENT_NOT_FOUND
                ));
        } catch (BusinessRuleException e) {
            log.warn("Business rule violation during patent update: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(
                    e.getMessage(),
                    PatentCodes.BUSINESS_RULE_VIOLATION
                ));
        } catch (ValidationException e) {
            log.warn("Validation error during patent update: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(
                    e.getMessage(),
                    PatentCodes.VALIDATION_ERROR
                ));
        } catch (Exception e) {
            log.error("Error updating patent with id {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(
                    PatentMessages.getMessage(PatentCodes.SERVER_ERROR),
                    PatentCodes.SERVER_ERROR
                ));
        }
	}
	
	/**
     * Delete a patent
     * @param id Patent ID
     * @return No content response
     */
	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deletePatent(@PathVariable UUID id) {
		 try {
	            log.info("Deleting patent with id: {}", id);
	            patentService.deletePatent(id);
	            return ResponseEntity.noContent().build();
	        } catch (ResourceNotFoundException e) {
	            log.warn("Patent not found for deletion with id: {}", id);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                .body(ApiResponse.error(
	                    e.getMessage(),
	                    PatentCodes.PATENT_NOT_FOUND
	                ));
	        } catch (Exception e) {
	            log.error("Error deleting patent with id {}: {}", id, e.getMessage());
	            return ResponseEntity.internalServerError()
	                .body(ApiResponse.error(
	                    PatentMessages.getMessage(PatentCodes.SERVER_ERROR),
	                    PatentCodes.SERVER_ERROR
	                ));
	        }
	}
}
