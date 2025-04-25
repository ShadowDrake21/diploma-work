package com.backend.app.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import lombok.Data;

public class PublicationDTO {
    private UUID id;
    private UUID projectId; 
    private LocalDate publicationDate;
    private String publicationSource;
    private String doiIsbn;
    private int startPage;
    private int endPage;
    private int journalVolume;
    private int issueNumber;
    private List<ResponseUserDTO> authors;
    
	public PublicationDTO(UUID id, UUID projectId, LocalDate publicationDate, String publicationSource, String doiIsbn,
			int startPage, int endPage, int journalVolume, int issueNumber, List<ResponseUserDTO> authors) {
		super();
		this.id = id;
		this.projectId = projectId;
		this.publicationDate = publicationDate;
		this.publicationSource = publicationSource;
		this.doiIsbn = doiIsbn;
		this.startPage = startPage;
		this.endPage = endPage;
		this.journalVolume = journalVolume;
		this.issueNumber = issueNumber;
		this.authors = authors;
	}
	public PublicationDTO() {
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
	public LocalDate getPublicationDate() {
		return publicationDate;
	}
	public void setPublicationDate(LocalDate publicationDate) {
		this.publicationDate = publicationDate;
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
	public int getStartPage() {
		return startPage;
	}
	public void setStartPage(int startPage) {
		this.startPage = startPage;
	}
	public int getEndPage() {
		return endPage;
	}
	public void setEndPage(int endPage) {
		this.endPage = endPage;
	}
	public int getJournalVolume() {
		return journalVolume;
	}
	public void setJournalVolume(int journalVolume) {
		this.journalVolume = journalVolume;
	}
	public int getIssueNumber() {
		return issueNumber;
	}
	public void setIssueNumber(int issueNumber) {
		this.issueNumber = issueNumber;
	}
	public List<ResponseUserDTO> getAuthors() {
		return authors;
	}
	public void setAuthors(List<ResponseUserDTO> authors) {
		this.authors = authors;
	}
    
    
}