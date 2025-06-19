package com.backend.app.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.backend.app.dto.miscellaneous.ProjectSearchCriteria;
import com.backend.app.dto.model.ProjectDTO;
import com.backend.app.enums.ProjectType;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.mapper.ProjectMapper;
import com.backend.app.model.Project;
import com.backend.app.model.Tag;
import com.backend.app.model.User;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.TagRepository;
import com.backend.app.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class ProjectServiceTest {
	@Mock
	private ProjectRepository projectRepository;
	@Mock
	private TagRepository tagRepository;
	@Mock
	private UserRepository userRepository;
	@Mock
	private ProjectMapper projectMapper;
	@Mock
	private ProjectSpecificationService specificationService;

	@InjectMocks
	private ProjectService projectService;
	
	private Project project;
	private ProjectDTO projectDTO;
	private User creator;
	
	@BeforeEach
    void setUp() {
        creator = User.builder().id(1L).username("creator").build();
        project = Project.builder()
                .id(UUID.randomUUID())
                .type(ProjectType.PUBLICATION)
                .title("Test Project")
                .description("Test Description")
                .progress(50)
                .creator(creator)
                .build();
                
        projectDTO = ProjectDTO.builder()
                .type(ProjectType.PUBLICATION)
                .title("Test Project")
                .description("Test Description")
                .progress(50)
                .createdBy(creator.getId())
                .build();
    }
	
	 @Test
	    void testFindAllProjects() {
	        Pageable pageable = PageRequest.of(0, 10);
	        Page<Project> projectPage = new PageImpl<>(List.of(project), pageable, 1);
	        
	        when(projectRepository.findAllWithCreator(any())).thenReturn(projectPage);
	        
	        Page<Project> result = projectService.findAllProjects(pageable);
	        
	        assertEquals(1, result.getTotalElements());
	        verify(projectRepository).findAllWithCreator(any());
	    }
	    
	    @Test
	    void testFindProjectById() {
	        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
	        
	        Optional<Project> result = projectService.findProjectById(project.getId());
	        
	        assertTrue(result.isPresent());
	        assertEquals(project.getTitle(), result.get().getTitle());
	    }
	    
	    @Test
	    void testFindProjectsByUserId() {
	        Pageable pageable = PageRequest.of(0, 10);
	        Page<Project> projectPage = new PageImpl<>(List.of(project), pageable, 1);
	        
	        when(projectRepository.findByCreatorId(creator.getId(), any())).thenReturn(projectPage);
	        
	        Page<Project> result = projectService.findProjectsByUserId(creator.getId(), pageable);
	        
	        assertEquals(1, result.getTotalElements());
	        verify(projectRepository).findByCreatorId(eq(creator.getId()), any());
	    }
	    
	    @Test
	    void testCreateProject() {
	        when(userRepository.findById(creator.getId())).thenReturn(Optional.of(creator));
	        when(tagRepository.findAllById(any())).thenReturn(new  ArrayList<>());
	        when(projectRepository.save(any())).thenReturn(project);
	        
	        Project result = projectService.createProject(projectDTO, creator.getId());
	        
	        assertNotNull(result);
	        assertEquals(creator, result.getCreator());
	        verify(projectRepository).save(any());
	    }
	    
	    @Test
	    void testCreateProjectUserNotFound() {
	        when(userRepository.findById(creator.getId())).thenReturn(Optional.empty());
	        
	        assertThrows(ResourceNotFoundException.class, () -> {
	            projectService.createProject(projectDTO, creator.getId());
	        });
	    }
	    
	    @Test
	    void testUpdateProject() {
	        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
	        when(tagRepository.findAllById(any())).thenReturn(new ArrayList<>());
	        when(projectRepository.save(any())).thenReturn(project);
	        
	        projectDTO.setTitle("Updated Title");
	        Optional<Project> result = projectService.updateProject(project.getId(), projectDTO);
	        
	        assertTrue(result.isPresent());
	        assertEquals("Updated Title", result.get().getTitle());
	    }
	    
	    @Test
	    void testSearchProjects() {
	        ProjectSearchCriteria criteria = new ProjectSearchCriteria();
	        Pageable pageable = PageRequest.of(0, 10);
	        Page<Project> projectPage = new PageImpl<>(List.of(project), pageable, 1);
	        
	        Specification<Project> mockSpec = Specification.where(null);
	        
	        when(specificationService.buildSpecification(criteria))
	            .thenReturn(mockSpec);
	        
	        when(projectRepository.findAll(mockSpec, pageable))
	            .thenReturn(projectPage);
	        
	        Page<Project> result = projectService.searchProjects(criteria, pageable);
	        
	        assertEquals(1, result.getTotalElements());
	        verify(projectRepository).findAll(mockSpec, pageable);
	    }
	    
	    @Test
	    void testDeleteProject() {
	        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
	        
	        projectService.deleteProject(project.getId());
	        
	        verify(projectRepository).delete(project);
	    }
}
