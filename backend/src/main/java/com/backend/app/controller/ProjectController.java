package com.backend.app.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.ProjectDTO;
import com.backend.app.mapper.ProjectMapper;
import com.backend.app.model.Project;
import com.backend.app.service.ProjectService;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
	@Autowired
	private ProjectService projectService;
	
	@Autowired
	private ProjectMapper projectMapper;
	
	@GetMapping
	public List<ProjectDTO> getAllProjects(){
		return projectService.findAllProjects().stream().map(projectMapper::toDTO).collect(Collectors.toList());
	}
	
	@GetMapping("/{id}")
	public ProjectDTO getProjectById(@PathVariable UUID id) {
		Optional<Project> projectOptional = projectService.findProjectById(id);
		return projectOptional.map(projectMapper::toDTO)
	            .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
	}
	
	@PostMapping
	public ProjectDTO createProject(@RequestBody Project project) {
		return projectMapper.toDTO(projectService.saveProject(project));
	}
	
	@PutMapping("/{id}")
	public ProjectDTO updateProject(@PathVariable UUID id, @RequestBody Project project) {
		Optional<Project> projectOptional =projectService.updateProject(id, project);
		return projectOptional.map(projectMapper::toDTO).orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
	}
	
	@DeleteMapping("/{id}")
	public void deleteProject(@PathVariable UUID id) {
		projectService.deleteProject(id);
	}
}
