package com.backend.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseUserDTO {
	private Long id;
	private String username;
	private String avatarUrl;
	
	public ResponseUserDTO(Long id, String username) {
		this(id, username, null);
	}


	
}
