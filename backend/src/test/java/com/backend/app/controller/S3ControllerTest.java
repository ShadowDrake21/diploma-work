package com.backend.app.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.backend.app.dto.model.FileMetadataDTO;
import com.backend.app.enums.ProjectType;
import com.backend.app.repository.FileMetadataRepository;
import com.backend.app.service.S3Service;

@ExtendWith(MockitoExtension.class)
public class S3ControllerTest {
	private MockMvc mockMvc;
	
	@Mock
    private S3Service s3Service;
    
    @Mock
    private FileMetadataRepository fileMetadataRepository;
    
    @InjectMocks
    private S3Controller s3Controller;
    
    private final UUID testEntityId = UUID.randomUUID();
    private final ProjectType testEntityType = ProjectType.PUBLICATION;
    private final String testFileName = "test.txt";
    private MockMultipartFile testFile;
    
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(s3Controller).build();
        
        testFile = new MockMultipartFile(
            "file", 
            testFileName, 
            "text/plain", 
            "test content".getBytes()
        );
    }
    
    @Test
    void uploadFile_ShouldReturnSuccessResponse() throws Exception {
        String expectedUrl = "http://test-url.com";
        when(s3Service.uploadFile(any(), any(), any())).thenReturn(expectedUrl);
        
        mockMvc.perform(multipart("/api/s3/upload")
                .file(testFile)
                .param("entityType", testEntityType.toString())
                .param("entityId", testEntityId.toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").value(expectedUrl));
    }
    
    @Test
    void updateFiles_ShouldReturnUpdatedFiles() throws Exception {
        FileMetadataDTO dto = new FileMetadataDTO(
            UUID.randomUUID(), 
            testFileName, 
            "http://test-url.com", 
            testEntityType, 
            testEntityId, 
            null, 
            null, 
            null
        );
        List<FileMetadataDTO> expectedFiles = Arrays.asList(dto);
        
        when(s3Service.updateFiles(any(), any(), any())).thenReturn(expectedFiles);
        
        mockMvc.perform(multipart("/api/s3/update-files")
                .file("files", testFile.getBytes())  
                .param("entityType", testEntityType.toString())
                .param("entityId", testEntityId.toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data[0].fileName").value(testFileName));
    }
    
    @Test
    void deleteFile_ShouldReturnSuccessResponse() throws Exception {
        mockMvc.perform(delete("/api/s3/delete/{entityType}/{entityId}/{fileName}", 
                testEntityType.toString(), testEntityId.toString(), testFileName))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    void getPublicFileUrl_ShouldReturnUrl() throws Exception {
        String expectedUrl = "http://test-url.com";
        when(s3Service.getPublicFileUrl(anyString())).thenReturn(expectedUrl);
        
        mockMvc.perform(get("/api/s3/public-url/{fileName}", testFileName))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").value(expectedUrl));
    }
    
    @Test
    void getFilesByEntity_ShouldReturnFiles() throws Exception {
        FileMetadataDTO dto = new FileMetadataDTO(
            UUID.randomUUID(), 
            testFileName, 
            "http://test-url.com", 
            testEntityType, 
            testEntityId, 
            null, 
            null, 
            null
        );
        List<FileMetadataDTO> expectedFiles = Arrays.asList(dto);
        
        when(s3Service.getFilesByEntity(anyString(), any())).thenReturn(expectedFiles);
        
        mockMvc.perform(get("/api/s3/files/{entityType}/{entityId}", 
                testEntityType.toString(), testEntityId.toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data[0].fileName").value(testFileName));
    }
}
