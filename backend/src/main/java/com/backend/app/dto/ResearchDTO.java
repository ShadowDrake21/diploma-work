package com.backend.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import lombok.Data;

public class ResearchDTO {
	 private UUID id;
	 private UUID projectId; 
	 private BigDecimal budget;
	 private LocalDate startDate;
	 private LocalDate endDate;
	 private String status;
	 private String fundingSource;
	 private List<ResponseUserDTO> participants;
	 
	 
	public ResearchDTO() {
		super();
	}
	public UUID getId() {
		return id;
	}
	public void setId(UUID id) {
		this.id = id;
	}
	public UUID getProjectId() {
		return projectId;
	}
	public void setProjectId(UUID projectId) {
		this.projectId = projectId;
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
	public List<ResponseUserDTO> getParticipants() {
		return participants;
	}
	public void setParticipants(List<ResponseUserDTO> participants) {
		this.participants = participants;
	}
}
