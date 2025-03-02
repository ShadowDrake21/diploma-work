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

@Entity
@Table(name = "research_projects")
public class Research {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
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
	private List<ResearchParticipant> researchParticipants = new ArrayList<>();
	
	public Research() {
		super();
	}
	
	public Research(Project project, BigDecimal budget, LocalDate startDate, LocalDate endDate, String status,
			String fundingSource) {
		super();
		this.project = project;
		this.budget = budget;
		this.startDate = startDate;
		this.endDate = endDate;
		this.status = status;
		this.fundingSource = fundingSource;
	}

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public Project getProject() {
		return project;
	}

	public void setProject(Project project) {
		this.project = project;
	}

	public BigDecimal getBudget() {
		return budget;
	}

	public void setBudget(BigDecimal budget) {
		this.budget = budget;
	}

	public LocalDate getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}

	public LocalDate getEndDate() {
		return endDate;
	}

	public void setEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getFundingSource() {
		return fundingSource;
	}

	public void setFundingSource(String fundingSource) {
		this.fundingSource = fundingSource;
	}

	public List<ResearchParticipant> getResearchParticipants() {
		return researchParticipants;
	}

	public void setResearchParticipants(List<ResearchParticipant> researchParticipants) {
		this.researchParticipants = researchParticipants;
	}
	
	public void addParticipant(ResearchParticipant researchParticipant) {
		researchParticipants.add(researchParticipant);
		researchParticipant.setResearch(this);
	}
	
	public void removeParticipant(ResearchParticipant researchParticipant) {
		researchParticipants.remove(researchParticipant);
		researchParticipant.setResearch(this);
	}
	
}
