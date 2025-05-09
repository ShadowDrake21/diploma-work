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

import com.backend.app.dto.ApiResponse;
import com.backend.app.dto.FileMetadataDTO;
import com.backend.app.enums.ProjectType;
import com.backend.app.service.S3Service;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/s3")
@Validated
public class S3Controller {
	private final S3Service s3Service;
	
	public S3Controller(S3Service s3Service) {
		this.s3Service = s3Service;
	}
	
	@PostMapping("/upload")
	public ResponseEntity<ApiResponse<String>> uploadFile(@RequestParam MultipartFile file, @RequestParam String entityType, @RequestParam UUID entityId) {
		try {
			ProjectType type = ProjectType.valueOf(entityType);
			String fileUrl = s3Service.uploadFile(file, type, entityId);
			return ResponseEntity.ok(ApiResponse.success("File uploaded successfully: " + fileUrl));
		} catch(IllegalArgumentException e) {
            return ResponseEntity.status(400)
                    .body(ApiResponse.error("Invalid entity type: " + entityType));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to upload file: " + e.getMessage()));
        }
	}
	
	@PostMapping("/update-files")
	public ResponseEntity<ApiResponse<String>> updateFiles( @RequestParam @NotBlank String entityType, @RequestParam @NotNull UUID entityId, @RequestParam("files") @NotEmpty List<MultipartFile> files) {
		try {
			ProjectType type = ProjectType.valueOf(entityType);
			s3Service.updateFiles(type, entityId, files);
			return ResponseEntity.ok(ApiResponse.success("Files updated successfully"));
		} catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid entity type"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to update files"));
        }
	}
	
	
    @DeleteMapping("/delete/{fileName}")
	public ResponseEntity<String> deleteFile(@PathVariable String fileName) {
		try {
			s3Service.deleteFile(fileName);
			return ResponseEntity.ok("File deleted successfully: " + fileName);
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Failed to delete file: " + e.getMessage());
		}
	}
    

    @GetMapping("/public-url/{fileName}")
    public ResponseEntity<ApiResponse<String>> getPublicFileUrl(@PathVariable String fileName) {
    	try {
			String fileUrl = s3Service.getPublicFileUrl(fileName);
			return ResponseEntity.ok(ApiResponse.success(fileUrl));
		}catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to generate public URL: " + e.getMessage()));
		}
    }
    
    @GetMapping("/metadata/{fileId}")
    public ResponseEntity<ApiResponse<FileMetadataDTO>> getFileMetadata(@PathVariable UUID fileId) {
    	try {
			FileMetadataDTO metadata = s3Service.getFileMetadata(fileId);
			return ResponseEntity.ok(ApiResponse.success(metadata));
		} catch (Exception e) {
			 return ResponseEntity.status(500)
	                    .body(ApiResponse.error("Failed to get file metadata"));		}
    }
    
    @GetMapping("/files/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<FileMetadataDTO>>> getFilesByEntity(@PathVariable String entityType, @PathVariable UUID entityId) {

    	try {
            System.out.println("Received request for entityType: " + entityType + ", entityId: " + entityId);
			List<FileMetadataDTO> files = s3Service.getFilesByEntity(entityType, entityId);
			return ResponseEntity.ok(ApiResponse.success(files));
		} catch (Exception e) {
			 System.err.println("Error in getFilesByEntity: " + e.getMessage());
		        e.printStackTrace();
		        return ResponseEntity.status(500)
	                    .body(ApiResponse.error("Failed to get files by entity"));		}
    }
}

