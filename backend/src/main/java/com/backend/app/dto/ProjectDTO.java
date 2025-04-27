package com.backend.app.dto;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.backend.app.enums.ProjectType;
import com.backend.app.model.Project;
import com.backend.app.model.Tag;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {
	private UUID id;
	private ProjectType type;
	
	@NotBlank(message = "Title cannot be blank")
	@Size(max = 256, message = "Title cannot exceed 256 characters")
	private String title;
	
    @NotBlank(message = "Description cannot be blank")
	private String description;
    
    @Min(value = 0, message = "Progress cannot be less than 0")
    @Max(value = 100, message = "Progress cannot exceed 100")
	private int progress;
    
    @Null(message = "Creation timestamp should not be provided")
	private LocalDateTime createdAt;
    
    @Null(message = "Update timestamp should not be provided")
	private LocalDateTime updatedAt;
	
	@Builder.Default
	private Set<UUID> tagIds =  Set.of();
	
	@NotNull(message = "Creator ID is required")
    private Long createdBy;

	public ProjectDTO fromEntity(Project project) {
		if (project == null) {
            return null;
        }
		
		return ProjectDTO.builder()
                .id(project.getId())
                .type(project.getType())
                .title(project.getTitle())
                .description(project.getDescription())
                .progress(project.getProgress())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .tagIds(project.getTags().stream()
                        .map(Tag::getId)
                        .collect(Collectors.toUnmodifiableSet()))
                .createdBy(project.getCreator() != null ? project.getCreator().getId() : null)
                .build();
    }
}
