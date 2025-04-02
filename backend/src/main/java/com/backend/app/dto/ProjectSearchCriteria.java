package com.backend.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.backend.app.enums.ProjectType;

public class ProjectSearchCriteria {
	 private String search;
	 private List<ProjectType> types;
	 private List<UUID> tags;
	 private LocalDate startDate;
	 private LocalDate endDate;
	 private List<String> status;
	 private int progressMin;
	 private int progressMax;
	 private String publicationSource;
	 private String doiIsbn;
	 private BigDecimal minBudget;
	 private BigDecimal maxBudget;
	 private String fundingSource;
	 private String registrationNumber;
	 private String issuingAuthority;
	 
	 public ProjectSearchCriteria() {} 
	 
	 
	public ProjectSearchCriteria(String search, List<ProjectType> types, List<UUID> tags, LocalDate startDate,
			LocalDate endDate, List<String> status, int progressMin, int progressMax, String publicationSource,
			String doiIsbn, BigDecimal minBudget, BigDecimal maxBudget, String fundingSource, String registrationNumber,
			String issuingAuthority) {
		super();
		this.search = search;
		this.types = types;
		this.tags = tags;
		this.startDate = startDate;
		this.endDate = endDate;
		this.status = status;
		this.progressMin = progressMin;
		this.progressMax = progressMax;
		this.publicationSource = publicationSource;
		this.doiIsbn = doiIsbn;
		this.minBudget = minBudget;
		this.maxBudget = maxBudget;
		this.fundingSource = fundingSource;
		this.registrationNumber = registrationNumber;
		this.issuingAuthority = issuingAuthority;
	}
	
	public String getSearch() {
		return search;
	}
	public void setSearch(String search) {
		this.search = search;
	}
	public List<ProjectType> getTypes() {
		return types;
	}
	public void setTypes(List<ProjectType> types) {
		this.types = types;
	}
	public List<UUID> getTags() {
		return tags;
	}
	public void setTags(List<UUID> tags) {
		this.tags = tags;
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
	public List<String> getStatus() {
		return status;
	}
	public void setStatus(List<String> status) {
		this.status = status;
	}
	public int getProgressMin() {
		return progressMin;
	}
	public void setProgressMin(int progressMin) {
		this.progressMin = progressMin;
	}
	public int getProgressMax() {
		return progressMax;
	}
	public void setProgressMax(int progressMax) {
		this.progressMax = progressMax;
	}
	public String getPublicationSource() {
		return publicationSource;
	}
	public void setPublicationSource(String publicationSource) {
		this.publicationSource = publicationSource;
	}
	public String getDoiIsbn() {
		return doiIsbn;
	}
	public void setDoiIsbn(String doiIsbn) {
		this.doiIsbn = doiIsbn;
	}
	public BigDecimal getMinBudget() {
		return minBudget;
	}
	public void setMinBudget(BigDecimal minBudget) {
		this.minBudget = minBudget;
	}
	public BigDecimal getMaxBudget() {
		return maxBudget;
	}
	public void setMaxBudget(BigDecimal maxBudget) {
		this.maxBudget = maxBudget;
	}
	public String getFundingSource() {
		return fundingSource;
	}
	public void setFundingSource(String fundingSource) {
		this.fundingSource = fundingSource;
	}
	public String getRegistrationNumber() {
		return registrationNumber;
	}
	public void setRegistrationNumber(String registrationNumber) {
		this.registrationNumber = registrationNumber;
	}
	public String getIssuingAuthority() {
		return issuingAuthority;
	}
	public void setIssuingAuthority(String issuingAuthority) {
		this.issuingAuthority = issuingAuthority;
	}
	 
	@Override
    public String toString() {
        return "ProjectSearchCriteria{" +
                "search='" + search + '\'' +
                ", types=" + types +
                ", tags=" + tags +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", status=" + status +
                ", progressMin=" + progressMin +
                ", progressMax=" + progressMax +
                ", publicationSource='" + publicationSource + '\'' +
                ", doiIsbn='" + doiIsbn + '\'' +
                ", minBudget=" + minBudget +
                ", maxBudget=" + maxBudget +
                ", fundingSource='" + fundingSource + '\'' +
                ", registrationNumber='" + registrationNumber + '\'' +
                ", issuingAuthority='" + issuingAuthority + '\'' +
                '}';
    }
}
