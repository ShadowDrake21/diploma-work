package com.backend.app.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import com.backend.app.enums.ProjectType;
import com.backend.app.model.Project;
import com.backend.app.model.User;

@DataJpaTest
public class ProjectRepositoryTest {
	 @Autowired
	    private ProjectRepository projectRepository;
	    
	    @Autowired
	    private UserRepository userRepository;
	    
	    @Test
	    void testFindAllWithDetails() {
	    	User user = userRepository.save(User.builder().username("test").build());
	    	 Project project = projectRepository.save(
	    	            Project.builder()
	    	                .type(ProjectType.PUBLICATION)
	    	                .title("Test Project")
	    	                .description("Test")
	    	                .progress(50)
	    	                .creator(user)
	    	                .build()
	    	        );
	    	 
	    	 Page<Project> result = projectRepository.findAllWithDetails(PageRequest.of(0, 10));
	    	 
	    	 assertEquals(1, result.getTotalElements());
	         assertEquals("Test Project", result.getContent().get(0).getTitle());
	    }
	    
	    @Test
	    void testFindByCreatorId() {
	        User user = userRepository.save(User.builder().username("creator").build());
	        projectRepository.save(
	            Project.builder()
	                .type(ProjectType.RESEARCH)
	                .title("User Project")
	                .description("Test")
	                .progress(30)
	                .creator(user)
	                .build()
	        );
	        
	        Page<Project> result = projectRepository.findByCreatorId(
	            user.getId(), 
	            PageRequest.of(0, 10, Sort.by("createdAt").descending())
	        );
	        
	        assertEquals(1, result.getTotalElements());
	        assertEquals("User Project", result.getContent().get(0).getTitle());
	    }
	    
	    @Test
	    void testGetProjectTypeAggregates() {
	        User user = userRepository.save(User.builder().username("test").build());
	        projectRepository.saveAll(List.of(
	            Project.builder().type(ProjectType.PUBLICATION).title("P1").description("D1").progress(0).creator(user).build(),
	            Project.builder().type(ProjectType.PATENT).title("P2").description("D2").progress(0).creator(user).build(),
	            Project.builder().type(ProjectType.PATENT).title("P3").description("D3").progress(0).creator(user).build()
	        ));
	        
	        Map<String, Long> aggregates = projectRepository.getProjectTypeAggregates();
	        
	        assertEquals(3, aggregates.get("totalProjects"));
	        assertEquals(1, aggregates.get("totalPublications"));
	        assertEquals(2, aggregates.get("totalPatents"));
	        assertEquals(0, aggregates.get("totalResearch"));
	    }
	    
	    @Test
	    void testGetProjectCountsByType() {
	        User user = userRepository.save(User.builder().username("test").build());
	        projectRepository.saveAll(List.of(
	            Project.builder().type(ProjectType.PUBLICATION).title("P1").description("D1").progress(0).creator(user).build(),
	            Project.builder().type(ProjectType.PUBLICATION).title("P2").description("D2").progress(0).creator(user).build(),
	            Project.builder().type(ProjectType.PATENT).title("P3").description("D3").progress(0).creator(user).build()
	        ));
	        
	        List<Object[]> counts = projectRepository.getProjectCountsByType();
	        
	        assertEquals(2, counts.size());
	        counts.forEach(count -> {
	            ProjectType type = (ProjectType) count[0];
	            Long countValue = (Long) count[1];
	            
	            if (type == ProjectType.PUBLICATION) {
	                assertEquals(2, countValue);
	            } else if (type == ProjectType.PATENT) {
	                assertEquals(1, countValue);
	            }
	        });
	    }
}
