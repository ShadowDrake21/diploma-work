package com.backend.app.dto.response;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import com.backend.app.dto.model.TagDTO;
import com.backend.app.enums.ProjectType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
	private UUID id;
	private ProjectType type;
	private String title;
	private String description;
	private int progress;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	
	@Builder.Default
	private Set<TagDTO> tags = Set.of();
	
    private Long createdBy;

}