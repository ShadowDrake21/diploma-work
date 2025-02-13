package com.backend.app.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "publications_authors")
public class PublicationAuthor {
	@EmbeddedId //for composite keys
	private PublicationAuthorId id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("publicationId")
	@JoinColumn(name = "publication_id", referencedColumnName = "id", nullable = false)
	private Publication publication;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("userId")
	@JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
	private User user;

	public PublicationAuthorId getId() {
		return id;
	}

	public void setId(PublicationAuthorId id) {
		this.id = id;
	}

	public Publication getPublication() {
		return publication;
	}

	public void setPublication(Publication publication) {
		this.publication = publication;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
	
	
}
