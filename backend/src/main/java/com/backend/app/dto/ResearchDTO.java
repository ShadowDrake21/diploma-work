package com.backend.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import lombok.Data;

@Data
public class ResearchDTO {
	 private UUID id;
	 private UUID projectId; 
	 private BigDecimal budget;
	 private LocalDate startDate;
	 private LocalDate endDate;
	 private String status;
	 private String fundingSource;
}
