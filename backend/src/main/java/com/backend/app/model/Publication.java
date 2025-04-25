package com.backend.app.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.ietf.jgss.Oid;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "publications")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
	
	@OneToMany(mappedBy = "publication", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
	private List<PublicationAuthor> publicationAuthors = new ArrayList<>();
	
	// ERROR: duplicate key value violates unique constraint "unique_publication_user"
	
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

	public List<PublicationAuthor> getPublicationAuthors() {
		return publicationAuthors;
	}

	public void setPublicationAuthors(List<PublicationAuthor> publicationAuthors) {
		this.publicationAuthors = publicationAuthors;
	}
	
	public void addPublicationAuthor(PublicationAuthor publicationAuthor) {
		publicationAuthors.add(publicationAuthor);
		publicationAuthor.setPublication(this);
	}
	
	public void removePublicationAuthor(PublicationAuthor publicationAuthor) {
		publicationAuthors.remove(publicationAuthor);
		publicationAuthor.setPublication(null);
	}
	
}
