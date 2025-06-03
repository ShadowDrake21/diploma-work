package com.backend.app.dto.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatentCoInventorDTO {
	@NotNull(message = "ID is required")
	@Positive(message = "ID must be positive")
	private Long id;
	
	@NotNull(message = "User ID is required")
	@Positive(message = "User ID must be positive")
	private Long userId;
	
	@NotBlank(message = "User name cannot be blank")
	private String userName;	
}
