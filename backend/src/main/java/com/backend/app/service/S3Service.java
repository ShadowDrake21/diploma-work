package com.backend.app.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;
import org.springframework.web.multipart.MultipartFile;

import com.backend.app.dto.model.FileMetadataDTO;
import com.backend.app.enums.ProjectType;
import com.backend.app.model.FileMetadata;
import com.backend.app.repository.FileMetadataRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {
	private final S3Client s3Client;
    private final FileMetadataRepository fileMetadataRepository;

	
	@Value("${aws.s3.bucket}")
	private String bucketName;

	@Value("${aws.region}")
	private String region;
	
	void setBucketName(String bucketName) {
		this.bucketName = bucketName;
	}
	
	void setRegion(String region) {
		this.region = region;
	}
	
	public String getPublicFileUrl(String fileName) {
		return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);
	}
	
	public List<FileMetadataDTO> updateFiles(ProjectType entityType, UUID entityId, List<MultipartFile> newFiles) {
		List<FileMetadata> existingFiles = fileMetadataRepository.findByEntityTypeAndEntityId(entityType, entityId);
		
		for(FileMetadata existingFile : existingFiles) {
			if(newFiles.stream().noneMatch(f->f.getOriginalFilename().equals(existingFile.getFileName()))) {
				deleteFile(existingFile);
			}
		}
		
		return newFiles.stream()
		        .filter(f -> !f.isEmpty())
		        .map(file -> {
		            try {
		                String checksum = DigestUtils.md5DigestAsHex(file.getBytes());
		                Optional<FileMetadata> existingMetadata = fileMetadataRepository.findByChecksumAndEntityTypeAndEntityId(checksum, entityType, entityId);
		                
		                if(existingMetadata.isPresent()) {
		                	return convertToDTO(existingMetadata.get()); 
		                } else {
		                	String url = uploadFile(file, entityType, entityId);
		                	FileMetadata newMetadata = fileMetadataRepository.findByFileUrl(url).orElseThrow(() -> new RuntimeException("Failed to retrieve saved metadata"));
		                    return convertToDTO(newMetadata);
		                }
		            } catch (IOException e) {
		                throw new RuntimeException("Error processing file", e);
		            }
		        })
		        .collect(Collectors.toList());
	}
	
	public String uploadFile(MultipartFile file, ProjectType entityType, UUID projectId) {
		String fileName = entityType.toString().toLowerCase() + "/" + projectId + "/" + file.getOriginalFilename();
		String fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);
		
		try {
			 String checksum = DigestUtils.md5DigestAsHex(file.getBytes());
		        long fileSize = file.getSize();
		        
		        Optional<FileMetadata> existingFile = fileMetadataRepository.findByChecksumAndEntityTypeAndEntityId(checksum,  entityType, projectId);
		        if (existingFile.isPresent()) {
		            return existingFile.get().getFileUrl();
		        }
		        
			s3Client.putObject(PutObjectRequest.builder().bucket(bucketName).key(fileName).contentType(file.getContentType()).build(), RequestBody.fromBytes(file.getBytes()));
						
			 FileMetadata metadata = FileMetadata.builder()
			            .fileName(file.getOriginalFilename())
			            .fileUrl(fileUrl)
			            .entityType(entityType)
			            .entityId(projectId)
			            .uploadedAt(LocalDateTime.now())
			            .fileSize(fileSize)
			            .checksum(checksum)
			            .build();
			 
	        fileMetadataRepository.save(metadata);
	        
			return fileUrl;
		}
		catch (IOException e) {
			throw new RuntimeException("Error uploading file: " + e.getMessage());
		}
	}
	
	 public String uploadIndependentFile(MultipartFile file, String fileName) {
	        String fileUrl = getPublicFileUrl(fileName);
	        
	        try {
	            s3Client.putObject(
	                PutObjectRequest.builder()
	                    .bucket(bucketName)
	                    .key(fileName)
	                    .contentType(file.getContentType())
	                    .build(), 
	                RequestBody.fromBytes(file.getBytes()));
	            
	            return fileUrl;
	        } catch (IOException e) {
	            throw new RuntimeException("Error uploading independent file", e);
	        }
	    }
	
	public void addFiles(ProjectType entityType, UUID entityId, List<MultipartFile> newFiles) {
		for(MultipartFile newFile:newFiles) {
			if(newFile.isEmpty()) {
				continue;
			}
			
			try {
				String checksum = DigestUtils.md5DigestAsHex(newFile.getBytes());
				
				boolean fileExists = fileMetadataRepository.existsByChecksumAndEntityTypeAndEntityId(checksum, entityType, entityId);
				
				if(!fileExists) {
					uploadFile(newFile, entityType, entityId);
				}
			} catch (Exception e) {
	            log.error("Error processing file: " + newFile.getOriginalFilename(), e);
			}
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
	
	public void deleteFile(FileMetadata fileMetadata) {
		String filePath = fileMetadata.getEntityType().toString().toLowerCase() + "/" + 
                fileMetadata.getEntityId() + "/" + fileMetadata.getFileName();
		deleteFile(filePath);
		fileMetadataRepository.delete(fileMetadata);
	}
	
	public String deleteFile(String filePath) {
		s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(filePath).build());
		
		return "File deleted: " + filePath;
	}
	
	public FileMetadataDTO getFileMetadata(UUID fileId) {
		FileMetadata metadata = fileMetadataRepository.findById(fileId).orElseThrow(() -> new RuntimeException("File metadata not found"));
		
		return new FileMetadataDTO(
                metadata.getId(),
                metadata.getFileName(),
                metadata.getFileUrl(),
                metadata.getEntityType(),
                metadata.getEntityId(),
                metadata.getUploadedAt(),
                metadata.getFileSize(),
                metadata.getChecksum()
        );
	}
	
	public List<FileMetadataDTO> getFilesByEntity(String entityType, UUID entityId) {
        System.out.println("Fetching files for entityType: " + entityType + ", entityId: " + entityId);

        try {
        	ProjectType projectType = ProjectType.valueOf(entityType.toUpperCase());
        	System.out.println("type: " + projectType);
        	List<FileMetadata> files = fileMetadataRepository.findByEntityTypeAndEntityId(projectType, entityId);
            System.out.println("Found files: " + files.size());
     
	     return files
	              .stream()
	              .map(metadata -> new FileMetadataDTO(
	                        metadata.getId(),
	                        metadata.getFileName(),
	                        String.format("https://%s.s3.%s.amazonaws.com/%s/%s/%s", bucketName, region, entityType.toLowerCase(), entityId, metadata.getFileName()),
	                        metadata.getEntityType(),
	                        metadata.getEntityId(),
	                        metadata.getUploadedAt(),
	                        metadata.getFileSize(),
	                        metadata.getChecksum()
	                ))
	                .collect(Collectors.toList());
	    }catch (Exception e) {
	    	 System.err.println("Error fetching files: " + e.getMessage());
	         e.printStackTrace();
	         throw e; 
		}}
	
	private FileMetadataDTO convertToDTO(FileMetadata metadata) {
	    return new FileMetadataDTO(
	        metadata.getId(),
	        metadata.getFileName(),
	        metadata.getFileUrl(),
	        metadata.getEntityType(),
	        metadata.getEntityId(),
	        metadata.getUploadedAt(),
	        metadata.getFileSize(),
	        metadata.getChecksum()
	    );
	}
}
