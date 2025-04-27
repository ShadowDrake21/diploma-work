package com.backend.app.model;

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
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;


@Entity
@Table(name="patents")
@Getter
@Setter
@ToString(exclude = {"project", "primaryAuthor", "coInventors"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patent {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(updatable = false, nullable = false)
	private UUID id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "primary_author", nullable = false)
	private User primaryAuthor;
	
	@Column(name="registration_number", length = 100)
	private String registrationNumber;
	
	@Column(name="registration_date", length = 100)
	@Temporal(TemporalType.DATE)
	private LocalDate registrationDate;
	
	@Column(name = "issuing_authority", length = 255)
	private String issuingAuthority;
	
	@OneToMany(mappedBy = "patent", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	@Builder.Default
	private List<PatentCoInventor> coInventors = new ArrayList<>();
	
	public void addCoInventor(PatentCoInventor coInventor) {
		coInventors.add(coInventor);
		coInventor.setPatent(this);
	}
	
	public void removeCoInventor(PatentCoInventor coInventor) {
		coInventors.remove(coInventor);
		coInventor.setPatent(null); 
	}
}
