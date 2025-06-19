package com.backend.app.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.util.DigestUtils;

import com.backend.app.dto.model.FileMetadataDTO;
import com.backend.app.enums.ProjectType;
import com.backend.app.model.FileMetadata;
import com.backend.app.repository.FileMetadataRepository;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

public class S3ServiceTest {
	@Mock
	private S3Client s3Client;
	
	@Mock
	private FileMetadataRepository fileMetadataRepository;
	
	@InjectMocks
	private S3Service s3Service;
	
	 private final String bucketName = "test-bucket";
	    private final String region = "test-region";
	    private final UUID testEntityId = UUID.randomUUID();
	    private final ProjectType testEntityType = ProjectType.PUBLICATION;
	    private final String testFileName = "test.txt";
	    private final String testFileContent = "test content";
	    private final String testChecksum = DigestUtils.md5DigestAsHex(testFileContent.getBytes());
	    private MockMultipartFile testFile;
	    
	    @BeforeEach
	    void setUp() {
	        s3Service = new S3Service(s3Client, fileMetadataRepository);
	        s3Service.setBucketName(bucketName);
	        s3Service.setRegion(region);
	        
	        testFile = new MockMultipartFile(
	            "file", 
	            testFileName, 
	            "text/plain", 
	            testFileContent.getBytes()
	        );
	    }
	    
	    @Test
	    void getPublicFileUrl_ShouldReturnCorrectUrl() {
	        String expectedUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, testFileName);
	        String actualUrl = s3Service.getPublicFileUrl(testFileName);
	        assertEquals(expectedUrl, actualUrl);
	    }
	    
	    @Test
	    void uploadFile_ShouldUploadNewFileAndSaveMetadata() throws IOException {
	        // Preparing mock behavior
	        when(fileMetadataRepository.findByChecksumAndEntityTypeAndEntityId(anyString(), any(), any()))
	            .thenReturn(Optional.empty());
	        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
	            .thenReturn(PutObjectResponse.builder().build());
	        
	        FileMetadata expectedMetadata = FileMetadata.builder()
	            .fileName(testFileName)
	            .fileUrl(String.format("https://%s.s3.%s.amazonaws.com/%s/%s/%s", 
	                bucketName, region, testEntityType.toString().toLowerCase(), testEntityId, testFileName))
	            .entityType(testEntityType)
	            .entityId(testEntityId)
	            .uploadedAt(LocalDateTime.now())
	            .fileSize((long) testFileContent.length())
	            .checksum(testChecksum)
	            .build();
	        
	        when(fileMetadataRepository.save(any(FileMetadata.class))).thenReturn(expectedMetadata);
	        
	        // Uploading
	        String resultUrl = s3Service.uploadFile(testFile, testEntityType, testEntityId);
	        
	        // Testing
	        assertNotNull(resultUrl);
	        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
	        verify(fileMetadataRepository).save(any(FileMetadata.class));
	    }
	    
	    
	    @Test
	    void uploadFile_ShouldReturnExistingFileUrlWhenChecksumMatches() throws IOException {
	        // Preparing mock behavior
	        FileMetadata existingMetadata = FileMetadata.builder()
	            .fileName(testFileName)
	            .fileUrl("existing-url")
	            .entityType(testEntityType)
	            .entityId(testEntityId)
	            .build();
	        
	        when(fileMetadataRepository.findByChecksumAndEntityTypeAndEntityId(testChecksum, testEntityType, testEntityId))
	            .thenReturn(Optional.of(existingMetadata));
	        
	        // Uploading
	        String resultUrl = s3Service.uploadFile(testFile, testEntityType, testEntityId);
	        
	        // Testing
	        assertEquals(existingMetadata.getFileUrl(), resultUrl);
	        verify(s3Client, never()).putObject(any(PutObjectRequest.class), any(RequestBody.class));
	        verify(fileMetadataRepository, never()).save(any());
	    }
	    
	    @Test
	    void updateFiles_ShouldDeleteFilesNotInNewList() throws IOException {
	    	 // Preparing mock behavior
	        FileMetadata existingFile1 = FileMetadata.builder()
	            .fileName("oldFile.txt")
	            .entityType(testEntityType)
	            .entityId(testEntityId)
	            .build();
	        
	        FileMetadata existingFile2 = FileMetadata.builder()
	            .fileName(testFileName)
	            .entityType(testEntityType)
	            .entityId(testEntityId)
	            .build();
	        
	        when(fileMetadataRepository.findByEntityTypeAndEntityId(testEntityType, testEntityId))
	            .thenReturn(Arrays.asList(existingFile1, existingFile2));
	        
	        when(fileMetadataRepository.findByChecksumAndEntityTypeAndEntityId(testChecksum, testEntityType, testEntityId))
	            .thenReturn(Optional.empty());
	        
	        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class))).thenReturn(PutObjectResponse.builder().build());
	        
	        // Updating files
	        List<FileMetadataDTO> result = s3Service.updateFiles(testEntityType, testEntityId, Arrays.asList(testFile));
	        
	        // Testing
	        assertEquals(1, result.size());
	        verify(fileMetadataRepository).delete(existingFile1);
	    }
	    
	    @Test
	    void getFilesByEntity_ShouldReturnFilesWithCorrectUrls() {
	    	 // Preparing mock behavior
	        FileMetadata metadata1 = FileMetadata.builder()
	            .id(UUID.randomUUID())
	            .fileName("file1.txt")
	            .entityType(testEntityType)
	            .entityId(testEntityId)
	            .uploadedAt(LocalDateTime.now())
	            .build();
	        
	        FileMetadata metadata2 = FileMetadata.builder()
	            .id(UUID.randomUUID())
	            .fileName("file2.txt")
	            .entityType(testEntityType)
	            .entityId(testEntityId)
	            .uploadedAt(LocalDateTime.now())
	            .build();
	        
	        when(fileMetadataRepository.findByEntityTypeAndEntityId(testEntityType, testEntityId))
	            .thenReturn(Arrays.asList(metadata1, metadata2));
	        
	        // Getting files
	        List<FileMetadataDTO> result = s3Service.getFilesByEntity(testEntityType.toString(), testEntityId);
	        
	        // Testing
	        assertEquals(2, result.size());
	        result.forEach(dto -> {
	            assertTrue(dto.getFileUrl().contains(
	                String.format("%s/%s/%s", testEntityType.toString().toLowerCase(), testEntityId, dto.getFileName())
	            ));
	        });
	    }
	    
	    @Test
	    void deleteFile_ShouldDeleteFromS3AndRepository() {
	        // Preparing mock behavior
	        FileMetadata metadata = FileMetadata.builder()
	            .fileName(testFileName)
	            .entityType(testEntityType)
	            .entityId(testEntityId)
	            .build();
	        
	        // Deleting
	        s3Service.deleteFile(metadata);
	        
	        // Testing
	        verify(s3Client).deleteObject(any(DeleteObjectRequest.class));
	        verify(fileMetadataRepository).delete(metadata);
	    }
}
