package com.backend.app.model;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "research_projects_participants", uniqueConstraints = {@UniqueConstraint(columnNames = {"research_project_id", "user_id"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResearchParticipant {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "research_project_id", referencedColumnName = "id", nullable = false)
	private Research research;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
	private User user;

	/**
     * Convenience constructor for creating the association
     * @param research The research project entity
     * @param user The user participant entity
     */
    public ResearchParticipant(Research research, User user) {
        this.research = research;
        this.user = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ResearchParticipant)) return false;
        ResearchParticipant that = (ResearchParticipant) o;
        return research != null && research.getId() != null && 
               user != null && user.getId() != null &&
               research.getId().equals(that.research.getId()) && 
               user.getId().equals(that.user.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
