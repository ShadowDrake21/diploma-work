package com.backend.app.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
    @Column(updatable = false, nullable = false)
	private UUID id;
	
	@Column(nullable = false, columnDefinition = "TEXT")
	private String content;
	
	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;
	
	@UpdateTimestamp
	@Column(nullable = false)
	private LocalDateTime updatedAt;
	
	@Column(nullable = false)
	@Builder.Default
	private int likes = 0;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "parent_comment_id")
	private Comment parentComment;
	
	@OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<Comment> replies = new ArrayList<>();
	
	public void addReply(Comment reply) {
		replies.add(reply);
		reply.setParentComment(reply);
	}
	
	public void removeReply(Comment reply) {
		replies.remove(reply);
		reply.setParentComment(null);
	}
	
	public void incrementLikes() {
		this.likes++;
	}
	
	public void decrementLikes() {
		if(this.likes > 0) {
			this.likes--;
		}
	}
}
