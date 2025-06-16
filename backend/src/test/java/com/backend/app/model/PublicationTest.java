package com.backend.app.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class PublicationTest {
	private Publication publication;
    private Project project;
    private User author;
    private PublicationAuthor publicationAuthor;
    
    @BeforeEach
    void setUp() {
        project = Project.builder().id(UUID.randomUUID()).build();
        author = User.builder().id(1L).build();
        
        publication = Publication.builder()
                .id(UUID.randomUUID())
                .project(project)
                .publicationDate(LocalDate.now())
                .publicationSource("Journal of Tests")
                .doiIsbn("123-456-789")
                .startPage(1)
                .endPage(10)
                .journalVolume(5)
                .issueNumber(3)
                .build();
                
        publicationAuthor = new PublicationAuthor(publication, author);
    }
    
    @Test
    void testPublicationCreation() {
        assertNotNull(publication);
        assertEquals("Journal of Tests", publication.getPublicationSource());
        assertEquals(1, publication.getStartPage());
        assertTrue(publication.getPublicationAuthors().isEmpty());
    }
    
    @Test
    void testAddPublicationAuthor() {
        publication.addPublicationAuthor(publicationAuthor);
        
        assertEquals(1, publication.getPublicationAuthors().size());
        assertEquals(publication, publicationAuthor.getPublication());
    }
    
    @Test
    void testRemovePublicationAuthor() {
        publication.addPublicationAuthor(publicationAuthor);
        publication.removePublicationAuthor(publicationAuthor);
        
        assertEquals(0, publication.getPublicationAuthors().size());
        assertNull(publicationAuthor.getPublication());
    }
    
    @Test
    void testProjectAssociation() {
        assertEquals(project, publication.getProject());
    }
}
