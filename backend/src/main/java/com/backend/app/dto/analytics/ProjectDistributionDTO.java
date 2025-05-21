package com.backend.app.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDistributionDTO {
	private long publicationCount;
	private long patentCount;
	private long researchCount;
}
