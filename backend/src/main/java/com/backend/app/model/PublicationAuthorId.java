package com.backend.app.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.Embeddable;

@Embeddable
public class PublicationAuthorId implements Serializable{
	private static final long serialVersionUID = 1L;
	private UUID publicationId;
	private Long userId;
	public UUID getPublicationId() {
		return publicationId;
	}
	public void setPublicationId(UUID publicationId) {
		this.publicationId = publicationId;
	}
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	
	@Override
	public int hashCode() {
		return Objects.hash(publicationId, userId);
	}
	
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		PublicationAuthorId other = (PublicationAuthorId) obj;
		return Objects.equals(publicationId, other.publicationId) && Objects.equals(userId, other.userId);
	}
	
	
}
