package com.backend.app.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.dto.create.CreatePublicationRequest;
import com.backend.app.dto.miscellaneous.ResponseUserDTO;
import com.backend.app.dto.model.PublicationDTO;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.model.Project;
import com.backend.app.model.Publication;
import com.backend.app.model.PublicationAuthor;
import com.backend.app.model.User;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.PublicationAuthorRepository;
import com.backend.app.repository.PublicationRepository;
import com.backend.app.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class PublicationServiceTest {
	 @Mock private PublicationRepository publicationRepository;
	    @Mock private ProjectRepository projectRepository;
	    @Mock private UserRepository userRepository;
	    @Mock private PublicationAuthorRepository publicationAuthorRepository;
	    
	    @InjectMocks private PublicationService publicationService;
	    
	    private UUID publicationId;
	    private UUID projectId;
	    private Long userId;
	    private Publication publication;
	    private Project project;
	    private User user;
	    private CreatePublicationRequest createRequest;
	    
	    @BeforeEach
	    void setUp() {
	        publicationId = UUID.randomUUID();
	        projectId = UUID.randomUUID();
	        userId = 1L;
	        
	        project = Project.builder().id(projectId).build();
	        user = User.builder().id(userId).build();
	        
	        publication = Publication.builder()
	                .id(publicationId)
	                .project(project)
	                .publicationDate(LocalDate.now())
	                .publicationSource("Test Journal")
	                .doiIsbn("123-456")
	                .startPage(1)
	                .endPage(10)
	                .journalVolume(5)
	                .issueNumber(3)
	                .build();
	                
	        createRequest = CreatePublicationRequest.builder()
	                .projectId(projectId)
	                .publicationDate(LocalDate.now())
	                .publicationSource("Test Journal")
	                .doiIsbn("123-456")
	                .startPage(1)
	                .endPage(10)
	                .journalVolume(5)
	                .issueNumber(3)
	                .authors(List.of(userId))
	                .build();
	    }
	    
	    @Test
	    void testFindPublicationById() {
	        when(publicationRepository.findByIdWithRelations(publicationId))
	            .thenReturn(Optional.of(publication));
	            
	        PublicationDTO result = publicationService.findPublicationById(publicationId);
	        
	        assertEquals(publicationId, result.getId());
	        assertEquals("Test Journal", result.getPublicationSource());
	    }
	    
	    @Test
	    void testFindPublicationByIdNotFound() {
	        when(publicationRepository.findByIdWithRelations(publicationId))
	            .thenReturn(Optional.empty());
	            
	        assertThrows(ResourceNotFoundException.class, () -> {
	            publicationService.findPublicationById(publicationId);
	        });
	    }
	    
	    @Test
	    void testCreatePublication() {
	        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
	        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
	        when(publicationRepository.save(any())).thenReturn(publication);
	        
	        Publication result = publicationService.createPublication(createRequest);
	        
	        assertNotNull(result);
	        assertEquals(projectId, result.getProject().getId());
	        verify(publicationAuthorRepository, times(1)).save(any());
	    }
	    
	    @Test
	    void testUpdatePublication() {
	        PublicationDTO updateDTO = PublicationDTO.builder()
	                .publicationSource("Updated Journal")
	                .authors(List.of(new ResponseUserDTO(userId, "testuser")))
	                .build();
	                
	        when(publicationRepository.findById(publicationId)).thenReturn(Optional.of(publication));
	        when(publicationAuthorRepository.getAuthorsInfoByPublication(publication))
	            .thenReturn(List.of(new ResponseUserDTO(userId, "testuser")));
	        
	        PublicationDTO result = publicationService.updatePublication(publicationId, updateDTO);
	        
	        assertEquals("Updated Journal", result.getPublicationSource());
	        assertEquals(1, result.getAuthors().size());
	    }
	    
	    @Test
	    void testAddPublicationAuthor() {
	        when(publicationRepository.findById(publicationId)).thenReturn(Optional.of(publication));
	        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
	        when(publicationAuthorRepository.existsByPublicationAndUser(publication, user))
	            .thenReturn(false);
	            
	        PublicationAuthor result = publicationService.addPublicationAuthor(publicationId, userId);
	        
	        assertNotNull(result);
	        assertEquals(publication, result.getPublication());
	        assertEquals(user, result.getUser());
	    }
	    
	    @Test
	    void testDeletePublication() {
	        publicationService.deleteProject(publicationId);
	        verify(publicationRepository).deleteById(publicationId);
	    }
}
