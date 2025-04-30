package com.backend.app.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents the many-to-many relationship between Publications and Users (authors).
 * Includes additional constraints and relationship management.
 * */
@Entity
@Table(name = "publications_authors", uniqueConstraints = {@UniqueConstraint(columnNames = {"publication_id", "user_id"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicationAuthor {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Version
	@Column (nullable = false)
    @Builder.Default
	private Integer version = 0;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "publication_id", referencedColumnName = "id", nullable = false)
	@JsonBackReference
	private Publication publication;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
	private User user;

	 /**
     * Convenience constructor for creating the association
     * @param publication The publication entity
     * @param user The user author entity
     */
	public PublicationAuthor(Publication publication, User user) {
		this.publication = publication;
		this.user = user;
	}

	 @Override
	 public boolean equals(Object o) {
	     if (this == o) return true;
	     if (!(o instanceof PublicationAuthor)) return false;
	      PublicationAuthor that = (PublicationAuthor) o;
	      return publication != null && publication.getId() != null && 
	               user != null && user.getId() != null &&
	               publication.getId().equals(that.publication.getId()) && 
	               user.getId().equals(that.user.getId());
	    }

	    @Override
	    public int hashCode() {
	        return getClass().hashCode();
	    }
	
	
}
