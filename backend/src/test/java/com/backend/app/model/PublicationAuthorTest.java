package com.backend.app.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import java.util.UUID;

import org.junit.jupiter.api.Test;

public class PublicationAuthorTest {
	@Test
    void testPublicationAuthorCreation() {
        Publication publication = new Publication();
        User user = User.builder().id(1L).build();
        
        PublicationAuthor publicationAuthor = new PublicationAuthor(publication, user);
        
        assertEquals(publication, publicationAuthor.getPublication());
        assertEquals(user, publicationAuthor.getUser());
        assertEquals(0, publicationAuthor.getVersion());
    }
    
    @Test
    void testEqualsAndHashCode() {
        Publication pub1 = Publication.builder().id(UUID.randomUUID()).build();
        User user1 = User.builder().id(1L).build();
        
        PublicationAuthor pa1 = new PublicationAuthor(pub1, user1);
        PublicationAuthor pa2 = new PublicationAuthor(pub1, user1);
        PublicationAuthor pa3 = new PublicationAuthor(Publication.builder().id(UUID.randomUUID()).build(), 
                            User.builder().id(2L).build());
        
        assertEquals(pa1, pa2);
        assertNotEquals(pa1, pa3);
        assertEquals(pa1.hashCode(), pa2.hashCode());
    }
}
