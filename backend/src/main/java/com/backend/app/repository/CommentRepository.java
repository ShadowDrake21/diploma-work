package com.backend.app.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.app.model.Comment;
import com.backend.app.model.Project;

public interface CommentRepository extends JpaRepository<Comment, UUID>{
	List<Comment> findByProjectIdAndParentCommentIsNull(UUID projectId);
	
	@Query("SELECT c FROM Comment c WHERE c.parentComment.id = :parentId ORDER BY c.createdAt ASC")
	List<Comment> findRepliesByParentId(@Param("parentId") UUID parentId);
	
	List<Comment> findByProject(Project project);
	
	long countByProjectId(UUID projectId);
	
	@Modifying
	@Query("DELETE FROM Comment c WHERE c.user.id = :userId")
	void deleteByUserId(@Param("userId") Long userId);
}
