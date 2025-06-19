package com.backend.app.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.dto.model.PublicationDTO;
import com.backend.app.dto.request.UpdatePublicationRequest;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.model.Project;
import com.backend.app.model.Publication;
import com.backend.app.model.PublicationAuthor;
import com.backend.app.model.User;
import com.backend.app.repository.PublicationRepository;

@ExtendWith(MockitoExtension.class)
public class UpdatePublicationRequestMapperTest {
	@Mock
    private PublicationRepository publicationRepository;

    @InjectMocks
    private UpdatePublicationRequestMapper mapper;

    private UUID publicationId = UUID.randomUUID();
    private Publication existingPublication;
    private User testUser;
    
    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        Project project = new Project();
        project.setId(UUID.randomUUID());

        existingPublication = new Publication();
        existingPublication.setProject(project);
        existingPublication.setPublicationDate(LocalDate.now());
        existingPublication.setPublicationSource("Original Source");
        existingPublication.setDoiIsbn("123-456-789");
        existingPublication.setJournalVolume(5);
        existingPublication.setIssueNumber(2);

        PublicationAuthor author = new PublicationAuthor();
        author.setUser(testUser);
        existingPublication.setPublicationAuthors(Collections.singletonList(author));
    }

    @Test
    void toPublicationDTO_ShouldMapAllFields() {
        UpdatePublicationRequest request = new UpdatePublicationRequest();
        request.setPublicationDate(LocalDate.of(2023, 1, 1));
        request.setPublicationSource("Updated Source");
        request.setDoiIsbn("987-654-321");
        request.setJournalVolume(6);
        request.setIssueNumber(3);
        request.setStartPage(10);
        request.setEndPage(20);
        when(publicationRepository.findById(publicationId)).thenReturn(Optional.of(existingPublication));

        PublicationDTO dto = mapper.toPublicationDTO(request, publicationId);

        assertEquals(request.getPublicationDate(), dto.getPublicationDate());
        assertEquals(request.getPublicationSource(), dto.getPublicationSource());
        assertEquals(request.getDoiIsbn(), dto.getDoiIsbn());
        assertEquals(request.getJournalVolume(), dto.getJournalVolume());
        assertEquals(request.getIssueNumber(), dto.getIssueNumber());
        assertEquals(request.getStartPage(), dto.getStartPage());
        assertEquals(request.getEndPage(), dto.getEndPage());
    }

    @Test
    void toPublicationDTO_ShouldUseExistingValuesWhenRequestValuesAreNull() {
        UpdatePublicationRequest request = new UpdatePublicationRequest();
        when(publicationRepository.findById(publicationId)).thenReturn(Optional.of(existingPublication));

        PublicationDTO dto = mapper.toPublicationDTO(request, publicationId);

        assertEquals(existingPublication.getPublicationDate(), dto.getPublicationDate());
        assertEquals(existingPublication.getPublicationSource(), dto.getPublicationSource());
        assertEquals(existingPublication.getDoiIsbn(), dto.getDoiIsbn());
        assertEquals(existingPublication.getJournalVolume(), dto.getJournalVolume());
        assertEquals(existingPublication.getIssueNumber(), dto.getIssueNumber());
    }

    @Test
    void toPublicationDTO_ShouldMapExistingAuthorsWhenRequestAuthorsIsNull() {
        UpdatePublicationRequest request = new UpdatePublicationRequest();
        when(publicationRepository.findById(publicationId)).thenReturn(Optional.of(existingPublication));
        PublicationDTO dto = mapper.toPublicationDTO(request, publicationId);

        assertEquals(1, dto.getAuthors().size());
        assertEquals(testUser.getId(), dto.getAuthors().get(0).getId());
        assertEquals(testUser.getUsername(), dto.getAuthors().get(0).getUsername());
    }

    @Test
    void toPublicationDTO_ShouldMapRequestAuthorsWhenProvided() {
        UpdatePublicationRequest request = new UpdatePublicationRequest();
        request.setAuthors(Arrays.asList(2L, 3L));
        when(publicationRepository.findById(publicationId)).thenReturn(Optional.of(existingPublication));

        PublicationDTO dto = mapper.toPublicationDTO(request, publicationId);

        assertEquals(2, dto.getAuthors().size());
        assertEquals(2L, dto.getAuthors().get(0).getId());
        assertEquals(3L, dto.getAuthors().get(1).getId());
    }

    @Test
    void toPublicationDTO_ShouldThrowExceptionWhenPublicationNotFound() {
        when(publicationRepository.findById(publicationId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            mapper.toPublicationDTO(new UpdatePublicationRequest(), publicationId);
        });
    }
}
