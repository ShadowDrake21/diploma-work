package com.backend.app.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.dto.model.TagDTO;
import com.backend.app.mapper.TagMapper;
import com.backend.app.model.Tag;
import com.backend.app.repository.TagRepository;

@ExtendWith(MockitoExtension.class)
public class TagServiceTest {
	@Mock
	private TagRepository tagRepository;
	
	@Mock
	private TagMapper tagMapper;
	
	@InjectMocks 
	private TagService tagService;
	
	@Test
    void testFindAllTags() {
        Tag tag = Tag.builder().id(UUID.randomUUID()).name("Test Tag").build();
        TagDTO tagDTO = TagDTO.builder().id(tag.getId()).name(tag.getName()).build();
        
        when(tagRepository.findAll()).thenReturn(List.of(tag));
        when(tagMapper.toDTO(tag)).thenReturn(tagDTO);
        
        List<TagDTO> result = tagService.findAllTags();
        
        assertEquals(1, result.size());
        assertEquals("Test Tag", result.get(0).getName());
    }
	
	@Test
    void testFindTagById() {
        UUID tagId = UUID.randomUUID();
        Tag tag = Tag.builder().id(tagId).name("Test Tag").build();
        TagDTO tagDTO = TagDTO.builder().id(tagId).name("Test Tag").build();
        
        when(tagRepository.findById(tagId)).thenReturn(Optional.of(tag));
        when(tagMapper.toDTO(tag)).thenReturn(tagDTO);
        
        Optional<TagDTO> result = tagService.findTagById(tagId);
        
        assertTrue(result.isPresent());
        assertEquals(tagId, result.get().getId());
    }
	
	@Test
    void testCreateTag() {
        TagDTO tagDTO = TagDTO.builder().name("New Tag").build();
        Tag tag = Tag.builder().name("New Tag").build();
        Tag savedTag = Tag.builder().id(UUID.randomUUID()).name("New Tag").build();
        TagDTO savedTagDTO = TagDTO.builder().id(savedTag.getId()).name("New Tag").build();
        
        when(tagMapper.toEntity(tagDTO)).thenReturn(tag);
        when(tagRepository.save(tag)).thenReturn(savedTag);
        when(tagMapper.toDTO(savedTag)).thenReturn(savedTagDTO);
        
        TagDTO result = tagService.createTag(tagDTO);
        
        assertNotNull(result.getId());
        assertEquals("New Tag", result.getName());
    }
	
    @Test
    void testUpdateTag() {
        UUID tagId = UUID.randomUUID();
        TagDTO tagDTO = TagDTO.builder().name("Updated Tag").build();
        Tag existingTag = Tag.builder().id(tagId).name("Original Tag").build();
        Tag updatedTag = Tag.builder().id(tagId).name("Updated Tag").build();
        TagDTO updatedTagDTO = TagDTO.builder().id(tagId).name("Updated Tag").build();
        
        when(tagRepository.findById(tagId)).thenReturn(Optional.of(existingTag));
        when(tagRepository.save(existingTag)).thenReturn(updatedTag);
        when(tagMapper.toDTO(updatedTag)).thenReturn(updatedTagDTO);
        
        Optional<TagDTO> result = tagService.updateTag(tagId, tagDTO);
        
        assertTrue(result.isPresent());
        assertEquals("Updated Tag", result.get().getName());
    }
    
    @Test
    void testDeleteTag() {
        UUID tagId = UUID.randomUUID();
        tagService.deleteTag(tagId);
        verify(tagRepository).deleteById(tagId);
    }
}
