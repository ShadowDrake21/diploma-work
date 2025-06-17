package com.backend.app.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.UUID;

import org.junit.jupiter.api.Test;

public class ResearchParticipantTest {
	 @Test
	    void testResearchParticipantCreation() {
	        Research research = Research.builder().id(UUID.randomUUID()).build();
	        User user = User.builder().id(1L).build();
	        
	        ResearchParticipant participant = new ResearchParticipant(research, user);
	        
	        assertEquals(research, participant.getResearch());
	        assertEquals(user, participant.getUser());
	    }
	    
	    @Test
	    void testEqualsAndHashCode() {
	        Research research1 = Research.builder().id(UUID.randomUUID()).build();
	        User user1 = User.builder().id(1L).build();
	        ResearchParticipant participant1 = new ResearchParticipant(research1, user1);
	        
	        ResearchParticipant participant2 = new ResearchParticipant(research1, user1);
	        ResearchParticipant differentParticipant = new ResearchParticipant(
	            Research.builder().id(UUID.randomUUID()).build(), 
	            User.builder().id(2L).build()
	        );
	        
	        assertEquals(participant1, participant2);
	        assertNotEquals(participant1, differentParticipant);
	        assertEquals(participant1.hashCode(), participant2.hashCode());
	    }
	    
	    @Test
	    void testNoArgsConstructor() {
	        ResearchParticipant participant = new ResearchParticipant();
	        assertNull(participant.getResearch());
	        assertNull(participant.getUser());
	    }
}
