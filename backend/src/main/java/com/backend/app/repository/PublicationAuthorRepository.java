package com.backend.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.app.model.PublicationAuthor;
import com.backend.app.model.PublicationAuthorId;

public interface PublicationAuthorRepository extends JpaRepository<PublicationAuthor, PublicationAuthorId> {

}
