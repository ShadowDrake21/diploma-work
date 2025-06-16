package com.backend.app.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.backend.app.enums.ProjectType;

public class ProjectTest {

	private Project project;
	private Tag tag;
	private User creator;
	private final UUID projectId = UUID.randomUUID();
	private final LocalDateTime now = LocalDateTime.now();

	@BeforeEach
	void setUp() {
		creator = User.builder().id(1L).username("creator").build();
		tag = Tag.builder().id(UUID.randomUUID()).name("Test Tag").build();

		project = Project.builder().id(projectId).type(ProjectType.PUBLICATION).title("Test Project")
				.description("Test Description").progress(50).createdAt(now).updatedAt(now).creator(creator).build();
	}

	@Test
	void testProjectCreation() {
		assertNotNull(project);
		assertEquals(projectId, project.getId());
		assertEquals(ProjectType.PUBLICATION, project.getType());
		assertEquals("Test Project", project.getTitle());
		assertEquals("Test Description", project.getDescription());
		assertEquals(50, project.getProgress());
		assertEquals(now, project.getCreatedAt());
		assertEquals(now, project.getUpdatedAt());
		assertEquals(creator, project.getCreator());
		assertTrue(project.getTags().isEmpty());
	}

	@Test
	void testAddTag() {
		project.addTag(tag);

		assertEquals(1, project.getTags().size());
		assertTrue(project.getTags().contains(tag));
		assertTrue(tag.getProjects().contains(project));
	}

	@Test
	void testRemoveTag() {
		project.addTag(tag);
		project.removeTag(tag);

		assertEquals(0, project.getTags().size());
		assertFalse(tag.getProjects().contains(project));
	}

	@Test
	void testEqualsAndHashCode() {
		Project sameProject = Project.builder().id(projectId).build();
		Project differentProject = Project.builder().id(UUID.randomUUID()).build();

		assertEquals(project, sameProject);
		assertNotEquals(project, differentProject);
		assertEquals(project.hashCode(), sameProject.hashCode());
	}

	@Test
	void testBuilderMethods() {
		Project builtProject = Project.builder().type(ProjectType.RESEARCH).title("Built Project")
				.description("Built Description").progress(75).build();

		assertEquals(ProjectType.RESEARCH, builtProject.getType());
		assertEquals("Built Project", builtProject.getTitle());
		assertEquals("Built Description", builtProject.getDescription());
		assertEquals(75, builtProject.getProgress());
		assertNull(builtProject.getId());

	}

	@Test
	void testAssociations() {
		Publication publication = new Publication();
		project.setPublication(publication);

		assertEquals(project, publication.getProject());
	}
}
