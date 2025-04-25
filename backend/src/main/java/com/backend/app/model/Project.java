package com.backend.app.model;


import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.backend.app.enums.ProjectType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.JoinColumn; 

@Entity
@Table(name = "projects")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Project {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ProjectType type;

	@Column(nullable = false, length = 256)
	private String title;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String description;
	
	@Column(nullable = false)
	private int progress;
	
	@CreationTimestamp
	@Column(name="created_at", updatable = false)
	private LocalDateTime createdAt;
	
	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;
	
	 @ManyToMany(cascade = CascadeType.ALL)
	    @JoinTable(
	        name = "project_tags",
	        joinColumns = @JoinColumn(name = "project_id"), 
	        inverseJoinColumns = @JoinColumn(name = "tag_id") 
	        )
	private Set<Tag> tags = new HashSet<>();
	 
	 
	 @ManyToOne(fetch = FetchType.LAZY)
	 @JoinColumn(name = "created_by", nullable = false)
	 private User creator;
	
	public Project() {
	}

	public Project(ProjectType type, String title, String description, int progress) {
		this.type = type;
		this.title = title;
		this.description = description;
		this.progress = progress;
	}
	
	public Project(UUID id, ProjectType type, String title, String description, int progress) {
		 this(type, title, description, progress);
	     this.id = id;
	}
	
	public void addTag(Tag tag) {
		tags.add(tag);
		tag.getProjects().add(this);
    }

    public void removeTag(Tag tag) {
    	tags.remove(tag);
    	tag.getProjects().remove(this);
    }

    public User getCreator() {
        return creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Project project)) return false;
        return id != null && id.equals(project.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
