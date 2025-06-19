package com.backend.app.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
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

import com.backend.app.dto.miscellaneous.ResponseUserDTO;
import com.backend.app.dto.model.PublicationDTO;
import com.backend.app.model.Project;
import com.backend.app.model.Publication;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.PublicationAuthorRepository;

@ExtendWith(MockitoExtension.class)

public class PublicationMapperTest {
	  @Mock private ProjectRepository projectRepository;
	    @Mock private PublicationAuthorRepository publicationAuthorRepository;
	    
	    @InjectMocks private PublicationMapper publicationMapper;
	    
	    private Publication publication;
	    private PublicationDTO publicationDTO;
	    private UUID projectId;
	    
	    @BeforeEach
	    void setUp() {
	        projectId = UUID.randomUUID();
	        
	        publication = Publication.builder()
	                .id(UUID.randomUUID())
	                .project(Project.builder().id(projectId).build())
	                .publicationDate(LocalDate.now())
	                .publicationSource("Test Journal")
	                .doiIsbn("123-456")
	                .startPage(1)
	                .endPage(10)
	                .journalVolume(5)
	                .issueNumber(3)
	                .build();
	                
	        publicationDTO = PublicationDTO.builder()
	                .id(publication.getId())
	                .projectId(projectId)
	                .publicationDate(publication.getPublicationDate())
	                .publicationSource(publication.getPublicationSource())
	                .doiIsbn(publication.getDoiIsbn())
	                .startPage(publication.getStartPage())
	                .endPage(publication.getEndPage())
	                .journalVolume(publication.getJournalVolume())
	                .issueNumber(publication.getIssueNumber())
	                .authors(List.of(new ResponseUserDTO(1L, "author")))
	                .build();
	    }
	    
	    @Test
	    void testToDTO() {
	        when(projectRepository.findById(projectId)).thenReturn(Optional.of(publication.getProject()));
	        when(publicationAuthorRepository.getAuthorsInfoByPublication(publication))
	            .thenReturn(List.of(new ResponseUserDTO(1L, "author")));
	            
	        PublicationDTO result = publicationMapper.toDTO(publication);
	        
	        assertEquals(publication.getId(), result.getId());
	        assertEquals(projectId, result.getProjectId());
	        assertEquals(1, result.getAuthors().size());
	    }
	    
	    @Test
	    void testToEntity() {
	        when(projectRepository.findById(projectId)).thenReturn(Optional.of(publication.getProject()));
	        
	        Publication result = publicationMapper.toEntity(publicationDTO);
	        
	        assertEquals(publicationDTO.getId(), result.getId());
	        assertEquals(projectId, result.getProject().getId());
	    }
	    
	    @Test
	    void testUpdatePublicationFromDto() {
	        PublicationDTO updateDTO = PublicationDTO.builder()
	                .publicationSource("Updated Journal")
	                .startPage(5)
	                .endPage(15)
	                .build();
	                
	        publicationMapper.updatePublicationFromDto(updateDTO, publication);
	        
	        assertEquals("Updated Journal", publication.getPublicationSource());
	        assertEquals(5, publication.getStartPage());
	        assertEquals(15, publication.getEndPage());
	    }
	    
	    @Test
	    void testNullHandling() {
	        assertNull(publicationMapper.toDTO(null));
	        assertNull(publicationMapper.toEntity(null));
	        
	        Publication publication = new Publication();
	        publicationMapper.updatePublicationFromDto(null, publication);
	    }
}
