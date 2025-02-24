package com.backend.app.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;


@Entity
@Table(name="patents")
public class Patent {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	
	@ManyToOne
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;
	
	@ManyToOne
	@JoinColumn(name = "primary_author", nullable = false)
	private User primaryAuthor;
	
	@Column(name="registration_number", length = 100)
	private String registrationNumber;
	
	@Column(name="registration_date", length = 100)
	@Temporal(TemporalType.DATE)
	private LocalDate registrationDate;
	
	@Column(name = "issuing_authority", length = 255)
	private String issuingAuthority;
	
	@OneToMany(mappedBy = "patent", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<PatentCoInventor> coInventors = new ArrayList<>();

	public Patent() {
		super();
	}

	public Patent(Project project, User primaryAuthor, String registrationNumber, LocalDate registrationDate,
			String issuingAuthority) {
		super();
		this.project = project;
		this.primaryAuthor = primaryAuthor;
		this.registrationNumber = registrationNumber;
		this.registrationDate = registrationDate;
		this.issuingAuthority = issuingAuthority;
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

	public User getPrimaryAuthor() {
		return primaryAuthor;
	}

	public void setPrimaryAuthor(User primaryAuthor) {
		this.primaryAuthor = primaryAuthor;
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

	public List<PatentCoInventor> getCoInventors() {
		return coInventors;
	}

	public void setCoInventors(List<PatentCoInventor> coInventors) {
		this.coInventors = coInventors;
	}
	
	public void addCoInventor(PatentCoInventor coInventor) {
		coInventors.add(coInventor);
		coInventor.setPatent(this); // the back-reference to this Patent
	}
	
	public void removeCoInventor(PatentCoInventor coInventor) {
		coInventors.remove(coInventor);
		coInventor.setPatent(null); 
	}
}
