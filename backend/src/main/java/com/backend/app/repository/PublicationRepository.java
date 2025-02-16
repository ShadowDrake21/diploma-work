package com.backend.app.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.app.model.Publication;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, UUID>{

}
