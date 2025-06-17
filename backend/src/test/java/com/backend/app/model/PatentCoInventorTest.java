package com.backend.app.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class PatentCoInventorTest {
	 private PatentCoInventor coInventor;
	    private Patent patent;
	    private User user;
	    
	    @BeforeEach
	    void setUp() {
	        patent = Patent.builder().id(UUID.randomUUID()).build();
	        user = User.builder().id(1L).build();
	        
	        coInventor = new PatentCoInventor();
	        coInventor.setId(1L);
	        coInventor.setPatent(patent);
	        coInventor.setUser(user);
	    }
	    
	    @Test
	    void testCoInventorCreation() {
	        assertNotNull(coInventor);
	        assertEquals(1L, coInventor.getId());
	        assertEquals(patent, coInventor.getPatent());
	        assertEquals(user, coInventor.getUser());
	    }
	    
	    @Test
	    void testEqualsAndHashCode() {
	        PatentCoInventor sameCoInventor = new PatentCoInventor();
	        sameCoInventor.setPatent(patent);
	        sameCoInventor.setUser(user);
	        
	        PatentCoInventor differentCoInventor = new PatentCoInventor();
	        differentCoInventor.setPatent(Patent.builder().id(UUID.randomUUID()).build());
	        differentCoInventor.setUser(User.builder().id(2L).build());
	        
	        assertTrue(coInventor.equals(sameCoInventor));
	        assertFalse(coInventor.equals(differentCoInventor));
	        assertEquals(coInventor.hashCode(), sameCoInventor.hashCode());
	    }
	    
	    @Test
	    void testEqualsWithNull() {
	        assertFalse(coInventor.equals(null));
	    }
}
