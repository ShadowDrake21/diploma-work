package com.backend.app.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.app.model.Tag;

public interface TagRepository extends JpaRepository<Tag, UUID> {

}
