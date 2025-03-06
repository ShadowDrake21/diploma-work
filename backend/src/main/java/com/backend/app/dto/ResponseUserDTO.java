package com.backend.app.dto;

public class ResponseUserDTO {
	private Long id;
	private String username;
	
	public ResponseUserDTO() {}

	public ResponseUserDTO(Long id, String username) {
		super();
		this.id = id;
		this.username = username;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	
}
