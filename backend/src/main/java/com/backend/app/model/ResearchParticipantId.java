package com.backend.app.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class ResearchParticipantId implements Serializable {
	private static final long serialVersionUID = 1L;
	private UUID researchId;
	private Long userId;
	
    public ResearchParticipantId() {}

    public ResearchParticipantId(UUID researchId, Long userId) {
        this.researchId = researchId;
        this.userId = userId;
    }

	public UUID getResearchId() {
		return researchId;
	}

	public void setResearchId(UUID researchId) {
		this.researchId = researchId;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	@Override
	public int hashCode() {
		return Objects.hash(researchId, userId);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ResearchParticipantId other = (ResearchParticipantId) obj;
		return Objects.equals(researchId, other.researchId) && Objects.equals(userId, other.userId);
	}
    
	
}
