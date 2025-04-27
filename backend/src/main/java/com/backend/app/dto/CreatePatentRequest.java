package com.backend.app.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.backend.app.util.DateFormat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating new patent records
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePatentRequest {
	  @NotNull(message = "Project ID is required")
	  private UUID projectId;
	  
	  @NotNull(message = "Primary author ID is required")
	  @Positive(message = "Author ID must be positive")
	  private Long primaryAuthorId;
	  
	  @NotBlank(message = "Registration number cannot be blank")
	  @Size(max = 100, message = "Registration number cannot exceed 100 characters")
	  private String registrationNumber;
	  
	  @NotNull(message = "Registration date is required")
	  private LocalDate registrationDate;
	  
	  @NotBlank(message = "Issuing authority cannot be blank")
	  @Size(max = 255, message = "Issuing authority cannot exceed 255 characters")
	  private String issuingAuthority;
	  
	  @NotNull(message = "Co-inventors list cannot be null")
	  private List<@Positive(message = "Co-inventor ID must be positive") Long> coInventorIds;

	  /**
	   * Sets registration date from string format
	   * @param dateString Date string in expected format
	   * @throws IllegalArgumentException if date string is invalid
	   */
	  public void setRegistrationDateFromString(String dateString) {
		  this.registrationDate = DateFormat.parseIncomeDate(dateString);
	  }
}
