package com.backend.app.model;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "publications")
public class Publication {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	
	@ManyToOne
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;
	
	@Column(nullable = false, name = "publication_date")
	private LocalDate publicationDate;
	
	@Column(nullable = false, name = "publication_source")
	private String publicationSource;
	
	@Column(nullable = false, name = "doi_isbn")
	private String doiIsbn;
	
	@Column(nullable = false, name = "start_page")
	private int startPage;

	@Column(nullable = false, name = "end_page")
	private int endPage;
	
	@Column(nullable = false, name = "journal_volume")
	private int journalVolume;
	
	@Column(nullable = false, name = "issue_number")
	private int issueNumber;
	
	public Publication() {
		super();
	}
	
	public Publication(Project project, LocalDate publicationDate, String publicationSource, String doiIsbn, int startPage, int endPage,
			int journalVolume, int issueNumber) {
		super();
		this.project = project;
		this.publicationDate = publicationDate;
		this.publicationSource = publicationSource;
		this.doiIsbn = doiIsbn;
		this.startPage = startPage;
		this.endPage = endPage;
		this.journalVolume = journalVolume;
		this.issueNumber = issueNumber;
	}


	public Publication(UUID projectId, LocalDate publicationDate, String publicationSource, String doiIsbn, int startPage, int endPage,
			int journalVolume, int issueNumber) {
		super();
		this.project = new Project();
		this.project.setId(projectId);
		this.publicationDate = publicationDate;
		this.publicationSource = publicationSource;
		this.doiIsbn = doiIsbn;
		this.startPage = startPage;
		this.endPage = endPage;
		this.journalVolume = journalVolume;
		this.issueNumber = issueNumber;
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
}
