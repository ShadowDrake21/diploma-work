package com.backend.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectWithDetailsDTO<T> {
	private ProjectDTO project;
	private T details;
}
