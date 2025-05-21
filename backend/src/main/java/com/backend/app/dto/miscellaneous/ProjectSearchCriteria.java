package com.backend.app.dto.miscellaneous;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.backend.app.enums.ProjectType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSearchCriteria {
	 private String search;
	 private List<ProjectType> types;
	 private List<UUID> tags;
	 private LocalDate startDate;
	 private LocalDate endDate;
	 private int progressMin;
	 private int progressMax;
	 private String publicationSource;
	 private String doiIsbn;
	 private BigDecimal minBudget;
	 private BigDecimal maxBudget;
	 private String fundingSource;
	 private String registrationNumber;
	 private String issuingAuthority;
}
