package com.backend.app.dto.miscellaneous;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorDTO {
	private Long id;
	private String username;
	private String email;
	private String avatarUrl;
}
