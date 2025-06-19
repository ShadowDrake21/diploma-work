package com.backend.app.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import com.backend.app.model.Project;
import com.backend.app.model.Publication;
import com.backend.app.model.User;

public class PublicationRepositoryTest {
	 @Autowired
	    private PublicationRepository publicationRepository;
	    
	    @Autowired
	    private TestEntityManager entityManager;
	    
	    @Test
	    void testFindByIdWithRelations() {
	        User creator = entityManager.persist(User.builder().username("creator").build());
	        Project project = entityManager.persist(Project.builder().creator(creator).build());
	        Publication publication = entityManager.persist(
	            Publication.builder()
	                .project(project)
	                .publicationDate(LocalDate.now())
	                .build()
	        );
	        
	        Optional<Publication> result = publicationRepository.findByIdWithRelations(publication.getId());
	        
	        assertTrue(result.isPresent());
	        assertEquals(project.getId(), result.get().getProject().getId());
	        assertEquals(creator.getId(), result.get().getProject().getCreator().getId());
	    }
	    
	    @Test
	    void testGetPublicationMetrics() {
	        entityManager.persist(
	            Publication.builder()
	                .project(entityManager.persist(Project.builder().build()))
	                .publicationDate(LocalDate.now())
	                .publicationSource("Journal 1")
	                .startPage(1)
	                .endPage(10)
	                .build()
	        );
	        
	        Map<String, Object> metrics = publicationRepository.getPublicationMetrics();
	        
	        assertEquals(1L, metrics.get("total"));
	        assertEquals(9.0, metrics.get("avgPages"));
	        assertNotNull(metrics.get("commonSource"));
	    }
	    
	    @Test
	    void testFindByProjectId() {
	        Project project = entityManager.persist(Project.builder().build());
	        Publication publication = entityManager.persist(
	            Publication.builder()
	                .project(project)
	                .build()
	        );
	        
	        List<Publication> result = publicationRepository.findByProjectId(project.getId());
	        
	        assertEquals(1, result.size());
	        assertEquals(publication.getId(), result.get(0).getId());
	    }
}
