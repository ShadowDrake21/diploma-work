package com.backend.app.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.app.model.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID>{

}
