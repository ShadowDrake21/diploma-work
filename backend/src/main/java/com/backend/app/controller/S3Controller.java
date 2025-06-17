package com.backend.app.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.backend.app.controller.codes.S3Codes;
import com.backend.app.controller.messages.S3Messages;
import com.backend.app.dto.model.FileMetadataDTO;
import com.backend.app.dto.response.ApiResponse;
import com.backend.app.enums.ProjectType;
import com.backend.app.exception.InvalidEntityTypeException;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.repository.FileMetadataRepository;
import com.backend.app.service.S3Service;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/s3")
@Validated
@RequiredArgsConstructor
public class S3Controller {
	private final S3Service s3Service;
    private final FileMetadataRepository fileMetadataRepository;
	
	@PostMapping("/upload")
	public ResponseEntity<ApiResponse<String>> uploadFile(@RequestParam MultipartFile file, @RequestParam String entityType, @RequestParam UUID entityId) {
		try {
			ProjectType type = ProjectType.valueOf(entityType);
			String fileUrl = s3Service.uploadFile(file, type, entityId);
			return ResponseEntity.ok(ApiResponse.success(
                    fileUrl,
                    S3Messages.getMessage(S3Codes.FILE_UPLOADED), S3Codes.FILE_UPLOADED));
		} catch (InvalidEntityTypeException e) {
            log.warn("Invalid entity type during upload: {}", entityType);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(
                            S3Messages.getMessage(S3Codes.INVALID_ENTITY_TYPE),
                            S3Codes.INVALID_ENTITY_TYPE));
        } catch (Exception e) {
            log.error("Error uploading file: ", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(
                            S3Messages.getMessage(S3Codes.FILE_UPLOAD_ERROR),
                            S3Codes.FILE_UPLOAD_ERROR));
        }
	}
	
	@PostMapping("/update-files")
	public ResponseEntity<ApiResponse<List<FileMetadataDTO>>> updateFiles( @RequestParam @NotBlank String entityType, @RequestParam @NotNull UUID entityId, @RequestParam("files") @NotEmpty List<MultipartFile> files) {
		try {
            ProjectType type = ProjectType.valueOf(entityType.toUpperCase());
            List<FileMetadataDTO> updatedFiles = s3Service.updateFiles(type, entityId, files);
            return ResponseEntity.ok(ApiResponse.success(
                    updatedFiles,
                    S3Messages.getMessage(S3Codes.FILES_UPDATED),S3Codes.FILES_UPDATED));
        } catch (InvalidEntityTypeException e) {
            log.warn("Invalid entity type during file update: {}", entityType);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(
                            S3Messages.getMessage(S3Codes.INVALID_ENTITY_TYPE),
                            S3Codes.INVALID_ENTITY_TYPE));
        } catch (Exception e) {
            log.error("Error updating files: ", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(
                            S3Messages.getMessage(S3Codes.FILE_UPDATE_ERROR),
                            S3Codes.FILE_UPDATE_ERROR));
        }
	}
	
	
    @DeleteMapping("/delete/{entityType}/{entityId}/{fileName:.+}")
	public ResponseEntity<ApiResponse<String>> deleteFile(@PathVariable String entityType,
		    @PathVariable UUID entityId, @PathVariable String fileName) {
		try {
			ProjectType type = ProjectType.valueOf(entityType.toUpperCase());
			String filePath = entityType.toLowerCase() + "/" + entityId + "/" + fileName;
			s3Service.deleteFile(filePath);
			
			fileMetadataRepository.deleteByEntityTypeAndEntityIdAndFileName(
					type,
		            entityId,
		            fileName);
			
			
			return ResponseEntity.ok(ApiResponse.success(
                    "File deleted successfully",
                    S3Messages.getMessage(S3Codes.FILE_DELETED),S3Codes.FILE_DELETED));
		}catch (InvalidEntityTypeException e) {
            log.warn("Invalid entity type during file deletion: {}", entityType);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(
                            S3Messages.getMessage(S3Codes.INVALID_ENTITY_TYPE),
                            S3Codes.INVALID_ENTITY_TYPE));
        } catch (ResourceNotFoundException e) {
            log.warn("File not found for deletion: {}/{}/{}", entityType, entityId, fileName);
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(
                            S3Messages.getMessage(S3Codes.FILE_NOT_FOUND),
                            S3Codes.FILE_NOT_FOUND));
        } catch (Exception e) {
            log.error("Error deleting file: ", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(
                            S3Messages.getMessage(S3Codes.FILE_DELETE_ERROR),
                            S3Codes.FILE_DELETE_ERROR));
        }
	}
    

    @GetMapping("/public-url/{fileName}")
    public ResponseEntity<ApiResponse<String>> getPublicFileUrl(@PathVariable String fileName) {
    	try {
            String fileUrl = s3Service.getPublicFileUrl(fileName);
            return ResponseEntity.ok(ApiResponse.success(
                    fileUrl,
                    S3Messages.getMessage(S3Codes.URL_GENERATED),S3Codes.URL_GENERATED));
        } catch (ResourceNotFoundException e) {
            log.warn("File not found for URL generation: {}", fileName);
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(
                            S3Messages.getMessage(S3Codes.FILE_NOT_FOUND),
                            S3Codes.FILE_NOT_FOUND));
        } catch (Exception e) {
            log.error("Error generating public URL: ", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(
                            S3Messages.getMessage(S3Codes.URL_GENERATION_ERROR),
                            S3Codes.URL_GENERATION_ERROR));
        }
    }
    
    @GetMapping("/metadata/{fileId}")
    public ResponseEntity<ApiResponse<FileMetadataDTO>> getFileMetadata(@PathVariable UUID fileId) {
    	 try {
             FileMetadataDTO metadata = s3Service.getFileMetadata(fileId);
             return ResponseEntity.ok(ApiResponse.success(
                     metadata,
                     S3Messages.getMessage(S3Codes.METADATA_FETCHED),S3Codes.METADATA_FETCHED));
         } catch (ResourceNotFoundException e) {
             log.warn("File metadata not found for ID: {}", fileId);
             return ResponseEntity.status(404)
                     .body(ApiResponse.error(
                             S3Messages.getMessage(S3Codes.METADATA_NOT_FOUND),
                             S3Codes.METADATA_NOT_FOUND));
         } catch (Exception e) {
             log.error("Error fetching file metadata: ", e);
             return ResponseEntity.internalServerError()
                     .body(ApiResponse.error(
                             S3Messages.getMessage(S3Codes.METADATA_FETCH_ERROR),
                             S3Codes.METADATA_FETCH_ERROR));
         }
    }
    
    @GetMapping("/files/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<FileMetadataDTO>>> getFilesByEntity(@PathVariable String entityType, @PathVariable UUID entityId) {
            try {
                List<FileMetadataDTO> files = s3Service.getFilesByEntity(entityType, entityId);
                return ResponseEntity.ok(ApiResponse.success(
                        files,
                        S3Messages.getMessage(S3Codes.FILES_FETCHED),S3Codes.FILES_FETCHED));
            } catch (InvalidEntityTypeException e) {
                log.warn("Invalid entity type during files fetch: {}", entityType);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(
                                S3Messages.getMessage(S3Codes.INVALID_ENTITY_TYPE),
                                S3Codes.INVALID_ENTITY_TYPE));
            } catch (Exception e) {
                log.error("Error fetching files by entity: ", e);
                return ResponseEntity.internalServerError()
                        .body(ApiResponse.error(
                                S3Messages.getMessage(S3Codes.FILES_FETCH_ERROR),
                                S3Codes.FILES_FETCH_ERROR));
            }
    }
}

