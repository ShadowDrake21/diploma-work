package com.backend.app.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import lombok.Data;

@Data
public class PatentDTO {
    private UUID id;
    private UUID projectId; 
    private Long primaryAuthorId;
    private UserDTO primaryAuthor;
    private String registrationNumber;
    private LocalDate registrationDate;
    private String issuingAuthority;
    private List<PatentCoInventorDTO> coInventors;
    
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
	public Long getPrimaryAuthorId() {
		return primaryAuthorId;
	}
	
	public UserDTO getPrimaryAuthor() {
		return primaryAuthor;
	}
	public void setPrimaryAuthor(UserDTO primaryAuthor) {
		this.primaryAuthor = primaryAuthor;
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
	public void setRegistrationDate(LocalDate registrationDate) {
		this.registrationDate = registrationDate;
	}
	public String getIssuingAuthority() {
		return issuingAuthority;
	}
	public void setIssuingAuthority(String issuingAuthority) {
		this.issuingAuthority = issuingAuthority;
	}
	public List<PatentCoInventorDTO> getCoInventors() {
		return coInventors;
	}
	public void setCoInventors(List<PatentCoInventorDTO> patentCoInventorsDTO) {
		this.coInventors = patentCoInventorsDTO;
	}
	
	
}
