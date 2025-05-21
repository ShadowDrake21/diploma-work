package com.backend.app.dto.model;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatentDTO {
	@Null(message = "ID should not be provided for new patents")
    private UUID id;
	
	@NotNull(message = "Project ID is required")
    private UUID projectId; 
	
	@NotNull(message = "Primary author ID is required")
    @Positive(message = "Author ID must be positive")
    private Long primaryAuthorId;
	
	@Null(message = "Primary author object should not be set directly")
    private transient UserDTO primaryAuthor;
	
	@NotBlank(message = "Registration number cannot be blank")
    @Size(max = 100, message = "Registration number cannot exceed 100 characters")
    private String registrationNumber;
	
	@PastOrPresent(message = "Registration date must be in the past or present")
    private LocalDate registrationDate;
	
	@NotBlank(message = "Issuing authority cannot be blank")
	@Size(max = 255, message = "Issuing authority cannot exceed 255 characters")
    private String issuingAuthority;
	
	@NotNull(message = "Co-inventors list cannot be null")
    private List<@Positive(message = "Co-inventor ID must be positive") Long> coInventors;
}
