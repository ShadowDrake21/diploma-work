package com.backend.app.controller;

import java.awt.desktop.UserSessionEvent.Reason;
import java.util.List;
import java.util.UUID;

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

import com.backend.app.controller.codes.PublicationCodes;
import com.backend.app.controller.messages.PublicationMessages;
import com.backend.app.dto.create.CreatePublicationRequest;
import com.backend.app.dto.model.PublicationDTO;
import com.backend.app.dto.request.UpdatePublicationRequest;
import com.backend.app.dto.response.ApiResponse;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.mapper.PublicationMapper;
import com.backend.app.mapper.UpdatePublicationRequestMapper;
import com.backend.app.model.Publication;
import com.backend.app.service.PublicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Tag(name = "Publication Management", description = "Endpoints for managin publications")
@RestController
@RequestMapping("/api/publications")
@RequiredArgsConstructor
public class PublicationController {
	private final PublicationService publicationService;
	private final PublicationMapper publicationMapper;
    private final UpdatePublicationRequestMapper requestMapper;

	@Operation(summary = "Get all publications")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved publications")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
	@GetMapping
	public ResponseEntity<ApiResponse<List<PublicationDTO>>> getAllPublications() {
		try {
			List<PublicationDTO> publications = publicationService.findAllPublications().stream()
					.map(publicationMapper::toDTO).toList();
			 return ResponseEntity.ok(ApiResponse.success(
	                    publications,
	                    PublicationMessages.getMessage(PublicationCodes.PUBLICATIONS_FETCHED),PublicationCodes.PUBLICATIONS_FETCHED
	            ));
		}  catch (Exception e) {
            log.error("Error fetching publications: ", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(
                            PublicationMessages.getMessage(PublicationCodes.SERVER_ERROR),
                            PublicationCodes.SERVER_ERROR
                    ));
        }
	}

	@Operation(summary = "Get publication by ID")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Publication found")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Publication not found")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<PublicationDTO>> getPublicationById(
			@Parameter(description = "ID of the publication to retrieve") @PathVariable UUID id) {

        try {
            PublicationDTO publication = publicationService.findPublicationById(id);
            return ResponseEntity.ok(ApiResponse.success(
                    publication,
                    PublicationMessages.getMessage(PublicationCodes.PUBLICATION_FETCHED),PublicationCodes.PUBLICATION_FETCHED
            ));
        } catch (ResourceNotFoundException e) {
            log.warn("Publication not found with ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(
                            e.getMessage(),
                            PublicationCodes.PUBLICATION_NOT_FOUND
                    ));
        } catch (Exception e) {
            log.error("Error fetching publication with ID {}: ", id, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(
                            PublicationMessages.getMessage(PublicationCodes.SERVER_ERROR),
                            PublicationCodes.SERVER_ERROR
                    ));
        }
	}

	@Operation(summary = "Create a new publication")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Publication created successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
	@PostMapping
	public ResponseEntity<ApiResponse<PublicationDTO>> createPublication(@Valid @RequestBody CreatePublicationRequest request) {
		 try {
	            Publication publication = publicationService.createPublication(request);
	            return ResponseEntity.status(HttpStatus.CREATED)
	                    .body(ApiResponse.success(
	                            publicationMapper.toDTO(publication),
	                            PublicationMessages.getMessage(PublicationCodes.PUBLICATION_CREATED),PublicationCodes.PUBLICATION_CREATED
	                    ));
	        } catch (ResourceNotFoundException e) {
	            log.warn("Project not found with ID: {}", request.getProjectId());
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(
	                            e.getMessage(),
	                            PublicationCodes.PROJECT_NOT_FOUND
	                    ));
	        } catch (Exception e) {
	            log.error("Error creating publication: ", e);
	            return ResponseEntity.internalServerError()
	                    .body(ApiResponse.error(
	                            PublicationMessages.getMessage(PublicationCodes.SERVER_ERROR),
	                            PublicationCodes.SERVER_ERROR
	                    ));
	        }
	}

	@Operation(summary = "Update as existing publication")
	 @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Publication updated successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Publication not found")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Concurrent modification detected")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<PublicationDTO>> updatePublication(
			@Parameter(description = "ID of the publication to update") @PathVariable UUID id,
			@Valid @RequestBody UpdatePublicationRequest request) {
		try {
            log.info("Updating publication with ID: {}", id);
            PublicationDTO dto = requestMapper.toPublicationDTO(request, id);
            PublicationDTO updated = publicationService.updatePublication(id, dto);
            return ResponseEntity.ok(ApiResponse.success(
                    updated,
                    PublicationMessages.getMessage(PublicationCodes.PUBLICATION_UPDATED),PublicationCodes.PUBLICATION_UPDATED
            ));
        } catch (ResourceNotFoundException e) {
            log.warn("Publication not found with ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(
                            e.getMessage(),
                            PublicationCodes.PUBLICATION_NOT_FOUND
                    ));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request to update publication: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(
                            e.getMessage(),
                            PublicationCodes.INVALID_REQUEST
                    ));
        } catch (Exception e) {
            log.error("Error updating publication with ID {}: ", id, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(
                            PublicationMessages.getMessage(PublicationCodes.SERVER_ERROR),
                            PublicationCodes.SERVER_ERROR
                    ));
        }
	}

	@Operation(summary = "Delete a publication")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Publication deleted successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Publication not found")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deletePublication(@Parameter(description = "ID of the publication to delete") @PathVariable UUID id) {
		 try {
	            publicationService.deleteProject(id);
	            return ResponseEntity.noContent().build();
	        } catch (ResourceNotFoundException e) {
	            log.warn("Publication not found with ID: {}", id);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(
	                            e.getMessage(),
	                            PublicationCodes.PUBLICATION_NOT_FOUND
	                    ));
	        } catch (Exception e) {
	            log.error("Error deleting publication with ID {}: ", id, e);
	            return ResponseEntity.internalServerError()
	                    .body(ApiResponse.error(
	                            PublicationMessages.getMessage(PublicationCodes.SERVER_ERROR),
	                            PublicationCodes.SERVER_ERROR
	                    ));
	        }
	}
}
