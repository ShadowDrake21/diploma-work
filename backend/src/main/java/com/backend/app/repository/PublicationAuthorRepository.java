package com.backend.app.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.app.dto.miscellaneous.ResponseUserDTO;
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
	
	@Modifying
    @Query("DELETE FROM PublicationAuthor pa WHERE pa.publication.id = :publicationId")
	void deleteByPublicationId(@Param("publicationId") UUID publicationId);
	
	@Query("SELECT pa FROM PublicationAuthor pa WHERE pa.publication.id = :publicationId")
	List<PublicationAuthor> findByPublicationId(@Param("publicationId") UUID publicationId);
	
    List<PublicationAuthor> findByPublication(Publication publication);
    
    @Modifying
    @Query("DELETE FROM PublicationAuthor pa WHERE pa.publication.id = :publicationId AND pa.user.id IN :userIds")
    void deleteByPublicationIdAndUserIds(
        @Param("publicationId") UUID publicationId,
        @Param("userIds") List<Long> userIds);
	
	@Query("SELECT new com.backend.app.dto.miscellaneous.ResponseUserDTO(u.id, u.username) " +
		       "FROM PublicationAuthor pa JOIN pa.user u WHERE pa.publication = :publication")
	List<ResponseUserDTO> getAuthorsInfoByPublication(@Param("publication") Publication publication);
			
}
