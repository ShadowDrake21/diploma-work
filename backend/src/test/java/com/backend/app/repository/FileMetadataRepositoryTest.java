package com.backend.app.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import com.backend.app.enums.ProjectType;
import com.backend.app.model.FileMetadata;

@DataJpaTest
public class FileMetadataRepositoryTest {
	 @Autowired
	    private TestEntityManager entityManager;
	    
	    @Autowired
	    private FileMetadataRepository fileMetadataRepository;
	    
	    @Test
	    void findByEntityTypeAndEntityId_ShouldReturnFiles() {
	        // Preparing mock behavior and data
	        ProjectType entityType = ProjectType.PUBLICATION;
	        UUID entityId = UUID.randomUUID();
	        
	        FileMetadata file1 = new FileMetadata();
	        file1.setFileName("file1.txt");
	        file1.setEntityType(entityType);
	        file1.setEntityId(entityId);
	        entityManager.persist(file1);
	        
	        FileMetadata file2 = new FileMetadata();
	        file2.setFileName("file2.txt");
	        file2.setEntityType(entityType);
	        file2.setEntityId(entityId);
	        entityManager.persist(file2);
	        
	        // Another entity
	        // Shouldn't be returned
	        FileMetadata file3 = new FileMetadata();
	        file3.setFileName("file3.txt");
	        file3.setEntityType(ProjectType.PATENT);
	        file3.setEntityId(entityId);
	        entityManager.persist(file3);
	        
	        entityManager.flush();
	        
	        // Act
	        List<FileMetadata> foundFiles = fileMetadataRepository.findByEntityTypeAndEntityId(entityType, entityId);
	        
	        // Assert
	        assertEquals(2, foundFiles.size());
	        assertTrue(foundFiles.stream().allMatch(f -> 
	            f.getEntityType() == entityType && f.getEntityId().equals(entityId)));
	    }
	    
	    @Test
	    void findByChecksumAndEntityTypeAndEntityId_ShouldReturnFile() {
	        // Prepare mock behavior and data
	        String checksum = "test-checksum";
	        ProjectType entityType = ProjectType.PUBLICATION;
	        UUID entityId = UUID.randomUUID();
	        
	        FileMetadata file = new FileMetadata();
	        file.setFileName("file.txt");
	        file.setChecksum(checksum);
	        file.setEntityType(entityType);
	        file.setEntityId(entityId);
	        entityManager.persist(file);
	        
	        entityManager.flush();
	        
	        // Finding by checksum
	        Optional<FileMetadata> foundFile = fileMetadataRepository
	            .findByChecksumAndEntityTypeAndEntityId(checksum, entityType, entityId);
	        
	        // Testing
	        assertTrue(foundFile.isPresent());
	        assertEquals(checksum, foundFile.get().getChecksum());
	    }
	    
	    @Test
	    void deleteByEntityTypeAndEntityIdAndFileName_ShouldDeleteFile() {
	        // Prepare mock behavior and data
	        ProjectType entityType = ProjectType.PUBLICATION;
	        UUID entityId = UUID.randomUUID();
	        String fileName = "file.txt";
	        
	        FileMetadata file = new FileMetadata();
	        file.setFileName(fileName);
	        file.setEntityType(entityType);
	        file.setEntityId(entityId);
	        entityManager.persist(file);
	        
	        entityManager.flush();
	        
	        // Deleting
	        fileMetadataRepository.deleteByEntityTypeAndEntityIdAndFileName(entityType, entityId, fileName);
	        
	        // Testing
	        List<FileMetadata> remainingFiles = fileMetadataRepository.findAll();
	        assertTrue(remainingFiles.isEmpty());
	    }
	}