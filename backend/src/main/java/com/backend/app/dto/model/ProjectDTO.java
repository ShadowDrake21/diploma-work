package com.backend.app.dto.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.backend.app.enums.ProjectType;
import com.backend.app.model.Project;
import com.backend.app.model.Tag;
import com.backend.app.validation.CreateValidation;
import com.backend.app.validation.UpdateValidation;

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
	
	 @NotNull(message = "Project type is required", groups = {CreateValidation.class, UpdateValidation.class})
	private ProjectType type;
	
	@NotBlank(message = "Title cannot be blank", groups = {CreateValidation.class, UpdateValidation.class})
	@Size(max = 256, message = "Title cannot exceed 256 characters")
	private String title;
	
    @NotBlank(message = "Description cannot be blank", groups = {CreateValidation.class, UpdateValidation.class})
	private String description;
    
    @Min(value = 0, message = "Progress cannot be less than 0", groups = {CreateValidation.class, UpdateValidation.class})
    @Max(value = 100, message = "Progress cannot exceed 100", groups = {CreateValidation.class, UpdateValidation.class})
	private int progress;
    
    @Null(message = "Creation timestamp should not be provided", groups = {CreateValidation.class, UpdateValidation.class})
	private LocalDateTime createdAt;
    
    @Null(message = "Update timestamp should not be provided", groups = {CreateValidation.class, UpdateValidation.class})
	private LocalDateTime updatedAt;
	
	@Builder.Default
	private Set<UUID> tagIds =  Set.of();
	
    private Long createdBy;
    
    private Long deletedUserId;

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
                .deletedUserId(project.getDeletedUserId())
                .build();
    }
}
