package com.backend.app.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.Accessors;

@Entity
@Table(name = "research_projects")
@Getter
@Setter
@ToString(exclude = {"project", "researchParticipants"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Accessors(chain = true)
public class Research {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(updatable = false, nullable = false)
	private UUID id;
	
	@ManyToOne
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@Column(nullable = false, precision = 15, scale = 2)
	private BigDecimal budget;
	
	@Column(nullable = false)
	private LocalDate startDate;
	
	@Column(nullable = false)
	private LocalDate endDate;
	
	@Column(nullable = false, length = 150)
	private String status;
	
	@Column(nullable = false, length = 255)
	private String fundingSource;
	
	@OneToMany(mappedBy = "research", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	@Builder.Default
	private List<ResearchParticipant> researchParticipants = new ArrayList<>();
	
	
	public Research addParticipant(ResearchParticipant participant) {
		researchParticipants.add(participant);
		participant.setResearch(this);
		return this;
	}
	
	public Research removeParticipant(ResearchParticipant participant) {
		researchParticipants.remove(participant);
		participant.setResearch(this);
		return this;
	}
	
	@Builder
	public Research(Project project, BigDecimal budget, LocalDate startDate, 
            LocalDate endDate, String status, String fundingSource,
            List<ResearchParticipant> participants) {
		this.project = project;
		this.budget = budget;
		this.startDate = startDate;
		this.endDate = endDate;
		this.status = status;
		this.fundingSource = fundingSource;
		if(participants != null) {
			this.researchParticipants = new ArrayList<>(participants);
		}
	}
}
