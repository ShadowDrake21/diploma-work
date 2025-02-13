package com.backend.app.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.Embeddable;

@Embeddable
public class PatentCoInventorId implements Serializable {
	private static final long serialVersionUID = 1L;
	private UUID patentId;
	private Long userId;
	
    public PatentCoInventorId() {}

    public PatentCoInventorId(UUID patentId, Long userId) {
        this.patentId = patentId;
        this.userId = userId;
    }
    
	public UUID getPatentId() {
		return patentId;
	}
	public void setPatentId(UUID patentId) {
		this.patentId = patentId;
	}
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	
	@Override
	public int hashCode() {
		return Objects.hash(patentId, userId);
	}
	
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		PatentCoInventorId other = (PatentCoInventorId) obj;
		return Objects.equals(patentId, other.patentId) && Objects.equals(userId, other.userId);
	}
	
	
}
