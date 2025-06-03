package com.backend.app.controller;

import java.util.List;
import java.util.Optional;
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

import com.backend.app.controller.codes.ResearchCodes;
import com.backend.app.controller.messages.ResearchMessages;
import com.backend.app.dto.create.CreateResearchRequest;
import com.backend.app.dto.model.ResearchDTO;
import com.backend.app.dto.response.ApiResponse;
import com.backend.app.exception.BusinessRuleException;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.exception.UnauthorizedAccessException;
import com.backend.app.mapper.ResearchMapper;
import com.backend.app.model.Research;
import com.backend.app.service.ResearchService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Tag(name = "Research Management", description = "Endpoints for managing research projects")
@RestController
@RequestMapping("/api/researches")
@RequiredArgsConstructor
public class ResearchController {
	private final ResearchService researchService;
	private final ResearchMapper researchMapper;

	@Operation(summary = "Get all research projects")
	@GetMapping
	public ResponseEntity<ApiResponse<List<ResearchDTO>>> getAllResearches(){
		try {
			log.info("Fetching all research projects");
			List<ResearchDTO> researches = researchService.findAllResearches().stream().map(researchMapper::toDTO).toList();
			log.debug("Found {} research projects", researches.size());
			return ResponseEntity.ok(ApiResponse.success(
                    researches,
                    ResearchMessages.getMessage(ResearchCodes.RESEARCHES_FETCHED),ResearchCodes.RESEARCHES_FETCHED)
            );
		} catch (Exception e) {
			 log.error("Error fetching research projects: ", e);
	            return ResponseEntity.internalServerError()
	                    .body(ApiResponse.error(
	                            ResearchMessages.getMessage(ResearchCodes.SERVER_ERROR),
	                            ResearchCodes.SERVER_ERROR
	                    ));
		}
	}
	
	@Operation(summary = "Get research project by ID")
	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<ResearchDTO>> getResearchById(@Parameter(description = "ID of the research project") @PathVariable UUID id) {
		try {
            log.info("Fetching research project with ID: {}", id);
            ResearchDTO research = researchService.findResearchById(id)
                    .map(researchMapper::toDTO)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            ResearchMessages.getMessage(ResearchCodes.RESEARCH_NOT_FOUND))
                    );
            log.debug("Found research project: {}", research);
            return ResponseEntity.ok(ApiResponse.success(
                    research,
                    ResearchMessages.getMessage(ResearchCodes.RESEARCH_FETCHED), ResearchCodes.RESEARCH_FETCHED)
            );
        } catch (ResourceNotFoundException e) {
            log.warn("Research not found with ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(
                            e.getMessage(),
                            ResearchCodes.RESEARCH_NOT_FOUND
                    ));
        } catch (Exception e) {
            log.error("Error fetching research project with ID {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(
                            ResearchMessages.getMessage(ResearchCodes.SERVER_ERROR),
                            ResearchCodes.SERVER_ERROR
                    ));
        }
	}
	
	@Operation(summary = "Create a new research project")
	@PostMapping
	public ResponseEntity<ApiResponse<ResearchDTO>> createResearch(@Valid @RequestBody CreateResearchRequest request) {
		 try {
	            log.info("Creating new research project with request: {}", request);
	            Research createdResearch = researchService.createResearch(request);
	            log.debug("Created research project with ID: {}", createdResearch.getId());
	            return ResponseEntity.status(HttpStatus.CREATED)
	                    .body(ApiResponse.success(
	                            researchMapper.toDTO(createdResearch),
	                            ResearchMessages.getMessage(ResearchCodes.RESEARCH_CREATED), ResearchCodes.RESEARCH_CREATED)
	                    );
	        } catch (BusinessRuleException e) {
	            log.warn("Business rule violation while creating research: {}", e.getMessage());
	            return ResponseEntity.badRequest()
	                    .body(ApiResponse.error(
	                            e.getMessage(),
	                            ResearchCodes.INVALID_RESEARCH_DATA
	                    ));
	        } catch (UnauthorizedAccessException e) {
	            log.warn("Unauthorized attempt to create research");
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(ApiResponse.error(
	                            e.getMessage(),
	                            ResearchCodes.ACCESS_DENIED
	                    ));
	        } catch (Exception e) {
	            log.error("Error creating research project: ", e);
	            return ResponseEntity.internalServerError()
	                    .body(ApiResponse.error(
	                            ResearchMessages.getMessage(ResearchCodes.SERVER_ERROR),
	                            ResearchCodes.SERVER_ERROR
	                    ));
	        }
	}
	
	@Operation(summary = "Update an existing research project")
	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<ResearchDTO>> updateResearch(@Parameter(description = "ID of the research project to update") @PathVariable UUID id, @Valid @RequestBody ResearchDTO researchDTO) {
		 try {
	            log.info("Updating research project with ID: {}, data: {}", id, researchDTO);
	            ResearchDTO updatedResearch = researchService.updateResearch(id, researchDTO);
	            log.debug("Updated research project: {}", updatedResearch);
	            return ResponseEntity.ok(ApiResponse.success(
	                    updatedResearch,
	                    ResearchMessages.getMessage(ResearchCodes.RESEARCH_UPDATED),ResearchCodes.RESEARCH_UPDATED)
	            );
	        } catch (ResourceNotFoundException e) {
	            log.warn("Research not found for update with ID: {}", id);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(
	                            e.getMessage(),
	                            ResearchCodes.RESEARCH_NOT_FOUND
	                    ));
	        } catch (BusinessRuleException e) {
	            log.warn("Business rule violation while updating research: {}", e.getMessage());
	            return ResponseEntity.badRequest()
	                    .body(ApiResponse.error(
	                            e.getMessage(),
	                            ResearchCodes.INVALID_RESEARCH_DATA
	                    ));
	        } catch (UnauthorizedAccessException e) {
	            log.warn("Unauthorized attempt to update research with ID: {}", id);
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(ApiResponse.error(
	                            e.getMessage(),
	                            ResearchCodes.ACCESS_DENIED
	                    ));
	        } catch (Exception e) {
	            log.error("Error updating research project with ID {}: {}", id, e.getMessage());
	            return ResponseEntity.internalServerError()
	                    .body(ApiResponse.error(
	                            ResearchMessages.getMessage(ResearchCodes.SERVER_ERROR),
	                            ResearchCodes.SERVER_ERROR
	                    ));
	        }
	}
	
	@Operation(summary = "Delete a research project")
	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteResearch(@Parameter(description = "ID of the research project to delete") @PathVariable UUID id) {
		 try {
	            log.info("Deleting research project with ID: {}", id);
	            researchService.deleteResearch(id);
	            log.debug("Deleted research project with ID: {}", id);
	            return ResponseEntity.noContent().build();
	        } catch (ResourceNotFoundException e) {
	            log.warn("Research not found for deletion with ID: {}", id);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(
	                            e.getMessage(),
	                            ResearchCodes.RESEARCH_NOT_FOUND
	                    ));
	        } catch (UnauthorizedAccessException e) {
	            log.warn("Unauthorized attempt to delete research with ID: {}", id);
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(ApiResponse.error(
	                            e.getMessage(),
	                            ResearchCodes.ACCESS_DENIED
	                    ));
	        } catch (Exception e) {
	            log.error("Error deleting research project with ID {}: {}", id, e.getMessage());
	            return ResponseEntity.internalServerError()
	                    .body(ApiResponse.error(
	                            ResearchMessages.getMessage(ResearchCodes.SERVER_ERROR),
	                            ResearchCodes.SERVER_ERROR
	                    ));
	        }
	}
}
