package com.backend.app.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.backend.app.util.DateFormat;

public class CreatePatentRequest {
	  private UUID projectId;
	    private Long primaryAuthorId;
	    private String registrationNumber;
	    private LocalDate registrationDate;
	    private String issuingAuthority;
	    private List<Long> coInventorsId;

	    public UUID getProjectId() {
	        return projectId;
	    }

	    public void setProjectId(UUID projectId) {
	        this.projectId = projectId;
	    }

	    public Long getPrimaryAuthorId() {
	        return primaryAuthorId;
	    }

	    public void setPrimaryAuthorId(Long primaryAuthorId) {
	        this.primaryAuthorId = primaryAuthorId;
	    }

	    public String getRegistrationNumber() {
	        return registrationNumber;
	    }

	    public void setRegistrationNumber(String registrationNumber) {
	        this.registrationNumber = registrationNumber;
	    }

	    public LocalDate getRegistrationDate() {
	        return registrationDate;
	    }

	    public void setRegistrationDate(String registrationDate) {
	        this.registrationDate = DateFormat.parseIncomeDate(registrationDate);
	    }

	    public String getIssuingAuthority() {
	        return issuingAuthority;
	    }

	    public void setIssuingAuthority(String issuingAuthority) {
	        this.issuingAuthority = issuingAuthority;
	    }

		public List<Long> getCoInventors() {
			return coInventorsId;
		}

		public void setCoInventors(List<Long> coInventorsId) {
			this.coInventorsId = coInventorsId;
		}

		public void setRegistrationDate(LocalDate registrationDate) {
			this.registrationDate = registrationDate;
		}
}
