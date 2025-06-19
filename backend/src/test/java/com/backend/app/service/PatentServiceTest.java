package com.backend.app.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.dto.create.CreatePatentRequest;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.model.Patent;
import com.backend.app.model.PatentCoInventor;
import com.backend.app.model.Project;
import com.backend.app.model.User;
import com.backend.app.repository.PatentRepository;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class PatentServiceTest {
	@Mock
	private PatentRepository patentRepository;
	@Mock
	private ProjectRepository projectRepository;
	@Mock
	private UserRepository userRepository;

	@InjectMocks
	private PatentService patentService;

	private Patent patent;
	private Project project;
	private User primaryAuthor;
	private User coInventor;
	private CreatePatentRequest request;

	@BeforeEach
	void setUp() {
		project = Project.builder().id(UUID.randomUUID()).build();
		primaryAuthor = User.builder().id(1L).build();
		coInventor = User.builder().id(2L).build();

		patent = Patent.builder().id(UUID.randomUUID()).project(project).primaryAuthor(primaryAuthor)
				.registrationNumber("US123456").build();

		request = CreatePatentRequest.builder().projectId(project.getId()).primaryAuthorId(primaryAuthor.getId())
				.registrationNumber("US654321").coInventorIds(List.of(coInventor.getId())).build();
	}

	@Test
	void testFindAllPatents() {
		when(patentRepository.findAll()).thenReturn(List.of(patent));

		List<Patent> result = patentService.findAllPatents();

		assertEquals(1, result.size());
		assertEquals("US123456", result.get(0).getRegistrationNumber());
	}

	@Test
	void testFindPatentById() {
		when(patentRepository.findByIdWithCoInventors(patent.getId())).thenReturn(Optional.of(patent));

		Optional<Patent> result = patentService.findPatentById(patent.getId());

		assertTrue(result.isPresent());
		assertEquals(project, result.get().getProject());
	}

	@Test
	void testCreatePatent() {
		when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
		when(userRepository.findById(primaryAuthor.getId())).thenReturn(Optional.of(primaryAuthor));
		when(userRepository.findById(coInventor.getId())).thenReturn(Optional.of(coInventor));
		when(patentRepository.save(any())).thenReturn(patent);

		Patent result = patentService.createPatent(request);

		assertNotNull(result);
		assertEquals(1, result.getCoInventors().size());
		verify(patentRepository).save(any());
	}

	@Test
	void testCreatePatentProjectNotFound() {
		when(projectRepository.findById(project.getId())).thenReturn(Optional.empty());

		assertThrows(ResourceNotFoundException.class, () -> {
			patentService.createPatent(request);
		});
	}

	@Test
	void testUpdatePatent() {
		Patent updatedPatent = Patent.builder().project(project).primaryAuthor(primaryAuthor)
				.registrationNumber("US999999").build();

		when(patentRepository.findByIdWithCoInventors(patent.getId())).thenReturn(Optional.of(patent));
		when(patentRepository.save(patent)).thenReturn(patent);

		Optional<Patent> result = patentService.updatePatent(patent.getId(), updatedPatent);

		assertTrue(result.isPresent());
		assertEquals("US999999", result.get().getRegistrationNumber());
	}

	@Test
	void testUpdateCoInventors() {
		User newCoInventor = User.builder().id(3L).build();
		PatentCoInventor existingCoInventor = new PatentCoInventor();
		existingCoInventor.setUser(coInventor);
		existingCoInventor.setPatent(patent);
		patent.getCoInventors().add(existingCoInventor);

		Patent updatedPatent = Patent.builder().project(project).primaryAuthor(primaryAuthor).build();

		PatentCoInventor newCoInventorEntity = new PatentCoInventor();
		newCoInventorEntity.setUser(newCoInventor);
		updatedPatent.getCoInventors().add(newCoInventorEntity);

		when(userRepository.existsById(newCoInventor.getId())).thenReturn(true);

		patentService.updateCoInventors(patent, updatedPatent);

		assertEquals(1, patent.getCoInventors().size());
		assertEquals(newCoInventor.getId(), patent.getCoInventors().get(0).getUser().getId());
	}

	@Test
	void testDeletePatent() {
		doNothing().when(patentRepository).deleteById(patent.getId());

		patentService.deletePatent(patent.getId());

		verify(patentRepository).deleteById(patent.getId());
	}
}
