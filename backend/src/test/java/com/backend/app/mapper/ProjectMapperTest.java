package com.backend.app.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.dto.model.ProjectDTO;
import com.backend.app.dto.model.TagDTO;
import com.backend.app.dto.response.ProjectResponse;
import com.backend.app.enums.ProjectType;
import com.backend.app.model.Project;
import com.backend.app.model.Tag;
import com.backend.app.model.User;
import com.backend.app.repository.TagRepository;
import com.backend.app.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class ProjectMapperTest {
	@Mock private TagMapper tagMapper;
    @Mock private TagRepository tagRepository;
    @Mock private UserRepository userRepository;
    
    @InjectMocks private ProjectMapper projectMapper;
    
    private Project project;
    private ProjectDTO projectDTO;
    private User creator;
    private Tag tag;
    
    @BeforeEach
    void setUp() {
        creator = User.builder().id(1L).username("creator").build();
        tag = Tag.builder().id(UUID.randomUUID()).name("Test Tag").build();
        
        project = Project.builder()
                .id(UUID.randomUUID())
                .type(ProjectType.PUBLICATION)
                .title("Test Project")
                .description("Test Description")
                .progress(50)
                .creator(creator)
                .tags(new HashSet<>(Set.of(tag)))
                .build();
                
        projectDTO = ProjectDTO.builder()
                .id(project.getId())
                .type(project.getType())
                .title(project.getTitle())
                .description(project.getDescription())
                .progress(project.getProgress())
                .createdBy(creator.getId())
                .tagIds(Set.of(tag.getId()))
                .build();
    }
    
    @Test
    void testToDTO() {
    	when(tagMapper.toDTO(tag)).thenReturn(TagDTO.builder().id(tag.getId()).name(tag.getName()).build());
        
        ProjectDTO result = projectMapper.toDTO(project);
        
        assertEquals(project.getId(), result.getId());
        assertEquals(project.getTitle(), result.getTitle());
        assertEquals(1, result.getTagIds().size());
        assertTrue(result.getTagIds().contains(tag.getId()));
    }
    
    @Test
    void testToEntity() {
        when(tagRepository.findAllById(projectDTO.getTagIds())).thenReturn(List.of(tag));
        when(userRepository.findById(creator.getId())).thenReturn(Optional.of(creator));
        
        Project result = projectMapper.toEntity(projectDTO);
        
        assertEquals(projectDTO.getId(), result.getId());
        assertEquals(projectDTO.getTitle(), result.getTitle());
        assertEquals(1, result.getTags().size());
        assertEquals(creator, result.getCreator());
    }
    
    @Test
    void testToResponse() {
        when(tagMapper.toDTO(tag)).thenReturn(TagDTO.builder().id(tag.getId()).name(tag.getName()).build());
        
        ProjectResponse result = projectMapper.toResponse(project);
        
        assertEquals(project.getId(), result.getId());
        assertEquals(project.getTitle(), result.getTitle());
        assertEquals(1, result.getTags().size());
    }
    
    @Test
    void testNullHandling() {
        assertNull(projectMapper.toDTO(null));
        assertNull(projectMapper.toEntity(null));
        assertNull(projectMapper.toResponse(null));
    }
    
    @Test
    void testGetTagsWithEmptyIds() {
        projectDTO.setTagIds(Collections.emptySet());
        Project result = projectMapper.toEntity(projectDTO);
        
        assertTrue(result.getTags().isEmpty());
    }
}
