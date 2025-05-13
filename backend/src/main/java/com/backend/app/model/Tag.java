package com.backend.app.model;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name="tags", uniqueConstraints = {
		@UniqueConstraint(columnNames = "name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tag {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(updatable = false, nullable = false)
	private UUID id;
	
	@Column(name = "name", length = 100, nullable = false)
	private String name;
	
	@ManyToMany(mappedBy = "tags")
	@JsonIgnore
	@Builder.Default
	private Set<Project> projects = new HashSet<>();
	
	 @Override
	    public boolean equals(Object o) {
	        if (this == o) return true;
	        if (!(o instanceof Tag tag)) return false;
	        return id != null && id.equals(tag.id);
	    }

	    @Override
	    public int hashCode() {
	        return getClass().hashCode();
	    }

	    @Override
	    public String toString() {
	        return "Tag{" +
	                "id=" + id +
	                ", name='" + name + '\'' +
	                '}';
	    }
}
