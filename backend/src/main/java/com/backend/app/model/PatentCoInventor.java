package com.backend.app.model;


import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "patents_co_inventors", uniqueConstraints = {@UniqueConstraint(columnNames = {"patent_id", "user_id"})})
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class PatentCoInventor {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "patent_id", referencedColumnName = "id", nullable = false)
	private Patent patent;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
	private User user;
	
	 @Override
	    public boolean equals(Object o) {
	        if (this == o) return true;
	        if (!(o instanceof PatentCoInventor)) return false;
	        PatentCoInventor that = (PatentCoInventor) o;
	        return Objects.equals(patent, that.patent) &&
	               Objects.equals(user, that.user);
	    }

	    @Override
	    public int hashCode() {
	        return Objects.hash(patent, user);
	    }
	
}
