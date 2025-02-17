package com.backend.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.app.model.Project;
import com.backend.app.repository.ProjectRepository;

@Service
public class ProjectService {
	@Autowired
	private ProjectRepository projectRepository;
	
	public List<Project> findAllProjects(){
		return projectRepository.findAll();
	}
	
	public Optional<Project> findProjectById(UUID id) {
		return projectRepository.findById(id);
	}
	
	public Optional<Project> updateProject(UUID id, Project newProject) {
		return projectRepository.findById(id).map(existingProject -> {
			existingProject.setType(newProject.getType());
			existingProject.setTitle(newProject.getTitle());
			existingProject.setDescription(newProject.getDescription());
			return projectRepository.save(existingProject);
		});
}
	
	public Project saveProject(Project project) {
		return projectRepository.save(project);
	}
	
	public void deleteProject(UUID id) {
		projectRepository.deleteById(id);
	}
}
