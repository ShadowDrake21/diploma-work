package com.backend.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResearchDTO {
	 private UUID id;
	 private UUID projectId; 
	 private BigDecimal budget;
	 private LocalDate startDate;
	 private LocalDate endDate;
	 private String status;
	 private String fundingSource;
	 private List<Long> participantIds;
}
