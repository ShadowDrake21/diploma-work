package com.backend.app.dto.miscellaneous;

import com.backend.app.dto.model.ProjectDTO;

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
