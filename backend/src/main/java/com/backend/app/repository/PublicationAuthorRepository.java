package com.backend.app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.app.model.Publication;
import com.backend.app.model.PublicationAuthor;
import com.backend.app.model.PublicationAuthorId;
import com.backend.app.model.User;

public interface PublicationAuthorRepository extends JpaRepository<PublicationAuthor, Long> {
	Optional<PublicationAuthor> findByPublicationAndUser(Publication publication, User user );
	boolean existsByPublicationAndUser(Publication publication, User user);
	void deleteByPublication(Publication publication);
}
