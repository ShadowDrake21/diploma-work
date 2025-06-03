package com.backend.app.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatentMetricsDTO {
	private long totalPatents;
    private double averageInventors;
    private String mostCommonAuthority;
    private long patentsThisYear;
}
