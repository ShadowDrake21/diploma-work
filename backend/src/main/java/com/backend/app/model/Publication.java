package com.backend.app.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

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
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "publications")
@Getter
@Setter
@ToString(exclude = {"project", "publicationAuthors"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Publication {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(updatable = false, nullable = false)
	private UUID id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;
	
	@Column(nullable = false, name = "publication_date")
	@Temporal(TemporalType.DATE)
	private LocalDate publicationDate;
	
	@Column(nullable = false, name = "publication_source", length = 255)
	private String publicationSource;
	
	@Column(nullable = false, name = "doi_isbn", length = 255)
	private String doiIsbn;
	
	@Column(nullable = false, name = "start_page")
	private int startPage;

	@Column(nullable = false, name = "end_page")
	private int endPage;
	
	@Column(nullable = false, name = "journal_volume")
	private int journalVolume;
	
	@Column(nullable = false, name = "issue_number")
	private int issueNumber;
	
	@OneToMany(mappedBy = "publication", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	@JsonManagedReference
	@Builder.Default
	private List<PublicationAuthor> publicationAuthors = new ArrayList<>();
	
	public void addPublicationAuthor(PublicationAuthor publicationAuthor) {
		publicationAuthors.add(publicationAuthor);
		publicationAuthor.setPublication(this);
	}
	
	public void removePublicationAuthor(PublicationAuthor publicationAuthor) {
		publicationAuthors.remove(publicationAuthor);
		publicationAuthor.setPublication(null);
	}
}
