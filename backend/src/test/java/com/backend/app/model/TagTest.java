package com.backend.app.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class TagTest {
	private Tag tag;
	private final UUID tagId = UUID.randomUUID();
	
	@BeforeEach
	void setUp() {
		tag = Tag.builder().id(tagId).name("Test Tag").build();
	}
	
	@Test
	void testTagCreation() {
		assertNotNull(tag);
		assertEquals(tagId, tag.getId());
		assertEquals("Test Tag", tag.getName());
		assertTrue(tag.getProjects().isEmpty());
	}
	
    @Test
    void testEqualsAndHashCode() {
        Tag sameTag = Tag.builder().id(tagId).build();
        Tag differentTag = Tag.builder().id(UUID.randomUUID()).build();
        
        assertEquals(tag, sameTag);
        assertNotEquals(tag, differentTag);
        assertEquals(tag.hashCode(), sameTag.hashCode());
    }
    
    @Test
    void testToString() {
        String toString = tag.toString();
        assertTrue(toString.contains("Test Tag"));
        assertTrue(toString.contains(tagId.toString()));
    }
    
    @Test
    void testProjectAssociation() {
    	Project project = Project.builder().build();
    	tag.getProjects().add(project);
    	
    	assertEquals(1, tag.getProjects().size());
    	assertTrue(tag.getProjects().contains(project));
    }
}
