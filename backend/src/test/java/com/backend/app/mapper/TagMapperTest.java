package com.backend.app.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.backend.app.dto.model.TagDTO;
import com.backend.app.model.Tag;

public class TagMapperTest {
	private TagMapper tagMapper = new TagMapper();
	
	@Test
    void testToDTO() {
        Tag tag = Tag.builder()
                .id(UUID.randomUUID())
                .name("Test Tag")
                .build();
                
        TagDTO dto = tagMapper.toDTO(tag);
        
        assertEquals(tag.getId(), dto.getId());
        assertEquals(tag.getName(), dto.getName());
    }
	
	 @Test
	    void testToEntity() {
	        TagDTO dto = TagDTO.builder()
	                .id(UUID.randomUUID())
	                .name("Test Tag")
	                .build();
	                
	        Tag tag = tagMapper.toEntity(dto);
	        
	        assertEquals(dto.getId(), tag.getId());
	        assertEquals(dto.getName(), tag.getName());
	    }
	    
	    @Test
	    void testUpdateEntityFromDTO() {
	        Tag tag = Tag.builder()
	                .id(UUID.randomUUID())
	                .name("Old Name")
	                .build();
	                
	        TagDTO dto = TagDTO.builder()
	                .name("New Name")
	                .build();
	                
	        tagMapper.updateEntityFromDTO(dto, tag);
	        
	        assertEquals("New Name", tag.getName());
	    }
	    
	    @Test
	    void testNullHandling() {
	        assertNull(tagMapper.toDTO(null));
	        assertNull(tagMapper.toEntity(null));
	        
	        Tag tag = new Tag();
	        tagMapper.updateEntityFromDTO(null, tag);
	    }
}
