package com.backend.app.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.app.model.ProjectTag;
import com.backend.app.model.ProjectTagId;

public interface ProjectTagRepository extends JpaRepository<ProjectTag, ProjectTagId>{

}
