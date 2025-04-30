package com.backend.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.app.dto.ResponseUserDTO;
import com.backend.app.model.Publication;
import com.backend.app.model.PublicationAuthor;
import com.backend.app.model.User;

import jakarta.transaction.Transactional;

public interface PublicationAuthorRepository extends JpaRepository<PublicationAuthor, Long> {
	Optional<PublicationAuthor> findByPublicationAndUser(Publication publication, User user );
	boolean existsByPublicationAndUser(Publication publication, User user);
	
	@Modifying
	@Transactional
	@Query("DELETE FROM PublicationAuthor pa WHERE pa.publication = :publication")
	void deleteByPublication(@Param("publication") Publication publication);
	
    List<PublicationAuthor> findByPublication(Publication publication);
	
	@Query("SELECT new com.backend.app.dto.ResponseUserDTO(u.id, u.username) " +
		       "FROM PublicationAuthor pa JOIN pa.user u WHERE pa.publication = :publication")
	List<ResponseUserDTO> getAuthorsInfoByPublication(@Param("publication") Publication publication);
			
}
