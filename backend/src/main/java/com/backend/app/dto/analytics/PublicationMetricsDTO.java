package com.backend.app.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@Builder 
@NoArgsConstructor 
@AllArgsConstructor
public class PublicationMetricsDTO {
    private long totalPublications;
    private double averagePages;
    private String mostCommonSource;
    private long publicationsThisYear;
}