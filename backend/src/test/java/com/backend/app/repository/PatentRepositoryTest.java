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
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.backend.app.model.Patent;
import com.backend.app.model.PatentCoInventor;
import com.backend.app.model.Project;
import com.backend.app.model.User;

@DataJpaTest
public class PatentRepositoryTest {
	@Autowired
	private PatentRepository patentRepository;
	
	@Autowired
	private ProjectRepository projectRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	 @Test
	    void testFindByProjectId() {
	        Project project = projectRepository.save(Project.builder().build());
	        User user = userRepository.save(User.builder().build());
	        
	        Patent patent = patentRepository.save(
	            Patent.builder()
	                .project(project)
	                .primaryAuthor(user)
	                .registrationNumber("US123")
	                .build()
	        );
	        
	        List<Patent> result = patentRepository.findByProjectId(project.getId());
	        
	        assertEquals(1, result.size());
	        assertEquals("US123", result.get(0).getRegistrationNumber());
	    }
	 
	 @Test
	    void testFindByIdWithCoInventors() {
	        Project project = projectRepository.save(Project.builder().build());
	        User user = userRepository.save(User.builder().build());
	        User coInventor = userRepository.save(User.builder().build());
	        
	        Patent patent = Patent.builder()
	            .project(project)
	            .primaryAuthor(user)
	            .registrationNumber("US456")
	            .build();
	        
	        PatentCoInventor coInventorEntity = new PatentCoInventor();
	        coInventorEntity.setUser(coInventor);
	        coInventorEntity.setPatent(patent);
	        patent.getCoInventors().add(coInventorEntity);
	        
	        patentRepository.save(patent);
	        
	        Optional<Patent> result = patentRepository.findByIdWithCoInventors(patent.getId());
	        
	        assertTrue(result.isPresent());
	        assertEquals(1, result.get().getCoInventors().size());
	    }
	 
	 @Test
	    void testGetPatentMetrics() {
	        Project project = projectRepository.save(Project.builder().build());
	        User user = userRepository.save(User.builder().build());
	        
	        patentRepository.saveAll(List.of(
	            Patent.builder()
	                .project(project)
	                .primaryAuthor(user)
	                .registrationNumber("US111")
	                .issuingAuthority("USPTO")
	                .registrationDate(LocalDate.now())
	                .build(),
	            Patent.builder()
	                .project(project)
	                .primaryAuthor(user)
	                .registrationNumber("US222")
	                .issuingAuthority("USPTO")
	                .registrationDate(LocalDate.now().minusYears(1))
	                .build()
	        ));
	        
	        Map<String, Object> metrics = patentRepository.getPatentMetrics();
	        
	        assertNotNull(metrics);
	        assertEquals(2L, metrics.get("total"));
	        assertEquals("USPTO", metrics.get("commonAuthority"));
	    }
}
