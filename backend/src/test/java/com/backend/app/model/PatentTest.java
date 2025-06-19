package com.backend.app.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class PatentTest {
	private Patent patent;
	private Project project;
	private User primaryAuthor;
	private User coInventorUser;
	private final UUID patentId = UUID.randomUUID();
    private final LocalDate registrationDate = LocalDate.now();

    @BeforeEach
    void setUp() {
        project = Project.builder().id(UUID.randomUUID()).build();
        primaryAuthor = User.builder().id(1L).username("inventor").build();
        coInventorUser = User.builder().id(2L).username("co-inventor").build();
        
        patent = Patent.builder()
                .id(patentId)
                .project(project)
                .primaryAuthor(primaryAuthor)
                .registrationNumber("US123456")
                .registrationDate(registrationDate)
                .issuingAuthority("USPTO")
                .build();
    }
    
    @Test
    void testPatentCreation() {
        assertNotNull(patent);
        assertEquals(patentId, patent.getId());
        assertEquals(project, patent.getProject());
        assertEquals(primaryAuthor, patent.getPrimaryAuthor());
        assertEquals("US123456", patent.getRegistrationNumber());
        assertEquals(registrationDate, patent.getRegistrationDate());
        assertEquals("USPTO", patent.getIssuingAuthority());
        assertTrue(patent.getCoInventors().isEmpty());
    }
    
    @Test
    void testAddCoInventor() {
        PatentCoInventor coInventor = new PatentCoInventor();
        coInventor.setUser(coInventorUser);
        
        patent.addCoInventor(coInventor);
        
        assertEquals(1, patent.getCoInventors().size());
        assertEquals(patent, coInventor.getPatent());
        assertTrue(patent.getCoInventors().contains(coInventor));
    }
    
    @Test
    void testRemoveCoInventor() {
        PatentCoInventor coInventor = new PatentCoInventor();
        coInventor.setUser(coInventorUser);
        patent.addCoInventor(coInventor);
        
        patent.removeCoInventor(coInventor);
        
        assertEquals(0, patent.getCoInventors().size());
        assertNull(coInventor.getPatent());
    }
    
    @Test
    void testValidation() {
        Patent invalidPatent = new Patent();
        
        assertThrows(IllegalStateException.class, () -> invalidPatent.setPrimaryAuthor(null));
        assertThrows(IllegalStateException.class, () -> invalidPatent.setProject(null));
    }
    
    @Test
    void testEqualsAndHashCode() {
        Patent samePatent = Patent.builder().id(patentId).build();
        Patent differentPatent = Patent.builder().id(UUID.randomUUID()).build();
        
        assertEquals(patent, samePatent);
        assertNotEquals(patent, differentPatent);
        assertEquals(patent.hashCode(), samePatent.hashCode());
    }
}
