package com.backend.app.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "patents_co_inventors")
public class PatentCoInventor {
	@EmbeddedId //for composite keys
	private PatentCoInventorId id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("patentId")
	@JoinColumn(name = "patent_id", referencedColumnName = "id", nullable = false)
	private Patent patent;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("userId")
	@JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
	private User user;

	public PatentCoInventorId getId() {
		return id;
	}

	public void setId(PatentCoInventorId id) {
		this.id = id;
	}

	public Patent getPatent() {
		return patent;
	}

	public void setPatent(Patent patent) {
		this.patent = patent;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
	
	
}
