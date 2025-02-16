package com.backend.app.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "research_projects_participants")
public class ResearchParticipant {
	@EmbeddedId
	private ResearchParticipantId id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("researchId")
	@JoinColumn(name = "publication_id", referencedColumnName = "id", nullable = false)
	private Research research;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("userId")
	@JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
	private User user;

	public ResearchParticipantId getId() {
		return id;
	}

	public void setId(ResearchParticipantId id) {
		this.id = id;
	}

	public Research getResearch() {
		return research;
	}

	public void setResearch(Research research) {
		this.research = research;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
}
