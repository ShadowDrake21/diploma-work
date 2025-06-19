package com.backend.app.dto.create;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateResearchRequest {
	 @NotNull(message = "Project ID is required")
	private UUID projectId;
	 @NotEmpty(message = "At least one participant is required")
	private List<Long> participantIds;
	 @NotNull(message = "Budget is required")
	 @DecimalMin(value = "0.0", inclusive = false,message = "Budget must be greater than 0")
	private BigDecimal budget;
	 @NotNull(message = "Start date is required")
	private LocalDate startDate;
	 @NotNull(message = "End date is required")
	private LocalDate endDate;
	 @NotBlank(message = "Status is required")
	@Size(max = 150, message = "Status cannot exceed 150 characters")
	private String status;
	 @NotBlank(message = "Funding source is required")
	 @Size(max = 255,message = "Funding source cannot exceed 255 characters")
	private String fundingSource;
}