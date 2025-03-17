package com.backend.app.service;

import java.io.IOException;
import java.lang.module.ModuleDescriptor.Builder;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.backend.app.dto.FileMetadataDTO;
import com.backend.app.enums.ProjectType;
import com.backend.app.model.FileMetadata;
import com.backend.app.repository.FileMetadataRepository;

import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

@Service
public class S3Service {
	private final S3Client s3Client;
//    private final S3Presigner s3Presigner;
    private final FileMetadataRepository fileMetadataRepository;

	
	@Value("${aws.s3.bucket}")
	private String bucketName;

	@Value("${aws.region}")
	private String region;
	
	public S3Service(S3Client s3Client, FileMetadataRepository fileMetadataRepository) {
		this.s3Client = s3Client;
//		this.s3Presigner = s3Presigner;
		this.fileMetadataRepository = fileMetadataRepository;
	}
	
	public String getPublicFileUrl(String fileName) {
		return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);
	}
	
	public String uploadFile(MultipartFile file, ProjectType entityType) {
		String fileName = file.getOriginalFilename();
		String fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);
		
		try {
			s3Client.putObject(PutObjectRequest.builder().bucket(bucketName).key(fileName).contentType(file.getContentType()).build(), RequestBody.fromBytes(file.getBytes()));
			
			LocalDateTime uploadedAt = new Date().toInstant().atZone(ZoneId.of("UTC")).toLocalDateTime();
			
	        FileMetadata metadata = new FileMetadata();
	        metadata.setFileName(fileName);
	        metadata.setFileUrl(fileUrl);
	        metadata.setEntityType(entityType); // or "patent", "research_project", etc.
	        metadata.setEntityId(UUID.randomUUID());
	        metadata.setUploadedAt(uploadedAt);
	        fileMetadataRepository.save(metadata);
	        
			return "File uploaded successfully: " + fileName;
		}
		catch (IOException e) {
			throw new RuntimeException("Error uploading file: " + e.getMessage());
		}
	}
	
	public byte[] downloadFile(String fileName) {
		try(ResponseInputStream<GetObjectResponse> response = s3Client.getObject(GetObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build())){
			return response.readAllBytes();
		}
		catch (IOException e) {
			throw new RuntimeException("Error downloading file: " + e.getMessage());
		}
		
	}
	
	public String deleteFile(String fileName) {
		s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(fileName).build());
		
		return "File deleted: " + fileName;
	}
	
//	public String generatePresignedUrl(String fileName) {
//		 try {
//		       GetObjectRequest getObjectRequest = GetObjectRequest.builder().bucket(bucketName).key(fileName).build();
//		       
//		       PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(builder -> builder.getObjectRequest(getObjectRequest).signatureDuration(Duration.ofHours(1)));
//		       return presignedRequest.url().toString();
//		    } catch (Exception e) {
//		        throw new RuntimeException("Failed to generate pre-signed URL", e);
//		    }
//	}
//	
	public FileMetadataDTO getFileMetadata(UUID fileId) {
		FileMetadata metadata = fileMetadataRepository.findById(fileId).orElseThrow(() -> new RuntimeException("File metadata not found"));
		
		return new FileMetadataDTO(
                metadata.getId(),
                metadata.getFileName(),
                metadata.getFileUrl(),
                metadata.getEntityType(),
                metadata.getEntityId(),
                metadata.getUploadedAt()
        );
	}
	
	public List<FileMetadataDTO> getFilesByEntity(String entityType, UUID entityId) {
        System.out.println("Fetching files for entityType: " + entityType + ", entityId: " + entityId);

        try {
        	List<FileMetadata> files = fileMetadataRepository.findByEntityTypeAndEntityId(entityType, entityId);
            System.out.println("Found files: " + files.size());
     
	     return files
	              .stream()
	              .map(metadata -> new FileMetadataDTO(
	                        metadata.getId(),
	                        metadata.getFileName(),
	                        metadata.getFileUrl(),
	                        metadata.getEntityType(),
	                        metadata.getEntityId(),
	                        metadata.getUploadedAt()
	                ))
	                .collect(Collectors.toList());
	    }catch (Exception e) {
	    	 System.err.println("Error fetching files: " + e.getMessage());
	         e.printStackTrace();
	         throw e; 
		}}
}
