package com.backend.app.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.dto.model.PatentDTO;
import com.backend.app.dto.model.UserDTO;
import com.backend.app.model.Patent;
import com.backend.app.model.PatentCoInventor;
import com.backend.app.model.Project;
import com.backend.app.model.User;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;

import io.micrometer.core.instrument.config.validate.ValidationException;

@ExtendWith(MockitoExtension.class)
public class PatentMapperTest {
	 @Mock private ProjectRepository projectRepository;
	    @Mock private UserRepository userRepository;
	    
	    @InjectMocks private PatentMapper patentMapper;
	    
	    private Patent patent;
	    private PatentDTO patentDTO;
	    private Project project;
	    private User primaryAuthor;
	    private User coInventor;
	    
	    @BeforeEach
	    void setUp() {
	        project = Project.builder().id(UUID.randomUUID()).build();
	        primaryAuthor = User.builder().id(1L).username("inventor").build();
	        coInventor = User.builder().id(2L).username("co-inventor").build();
	        
	        PatentCoInventor coInventorEntity = new PatentCoInventor();
	        coInventorEntity.setUser(coInventor);
	        
	        patent = Patent.builder()
	                .id(UUID.randomUUID())
	                .project(project)
	                .primaryAuthor(primaryAuthor)
	                .registrationNumber("US123456")
	                .coInventors(List.of(coInventorEntity))
	                .build();
	                
	        patentDTO = PatentDTO.builder()
	                .id(patent.getId())
	                .projectId(project.getId())
	                .primaryAuthorId(primaryAuthor.getId())
	                .registrationNumber("US654321")
	                .coInventors(List.of(coInventor.getId()))
	                .build();
	    }
	    
	    @Test
	    void testToDTO() {
	        PatentDTO result = patentMapper.toDTO(patent);
	        
	        assertEquals(patent.getId(), result.getId());
	        assertEquals(project.getId(), result.getProjectId());
	        assertEquals(primaryAuthor.getId(), result.getPrimaryAuthorId());
	        assertEquals(1, result.getCoInventors().size());
	        assertEquals(coInventor.getId(), result.getCoInventors().get(0));
	    }
	    
	    @Test
	    void testToEntity() {
	        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
	        when(userRepository.findById(primaryAuthor.getId())).thenReturn(Optional.of(primaryAuthor));
	        when(userRepository.findById(coInventor.getId())).thenReturn(Optional.of(coInventor));
	        
	        Patent result = patentMapper.toEntity(patentDTO);
	        
	        assertEquals(patentDTO.getId(), result.getId());
	        assertEquals(project, result.getProject());
	        assertEquals(primaryAuthor, result.getPrimaryAuthor());
	        assertEquals(1, result.getCoInventors().size());
	    }
	    
	    @Test
	    void testToEntityProjectNotFound() {
	        when(projectRepository.findById(project.getId())).thenReturn(Optional.empty());
	        
	        assertThrows(ValidationException.class, () -> {
	            patentMapper.toEntity(patentDTO);
	        });
	    }
	    
	    @Test
	    void testNullHandling() {
	        assertNull(patentMapper.toDTO(null));
	        assertNull(patentMapper.toEntity(null));
	    }
	    
	    @Test
	    void testMapToUserDTO() {
	        UserDTO result = patentMapper.mapToUserDTO(primaryAuthor);
	        
	        assertEquals(primaryAuthor.getId(), result.getId());
	        assertEquals(primaryAuthor.getUsername(), result.getUsername());
	    }
}
