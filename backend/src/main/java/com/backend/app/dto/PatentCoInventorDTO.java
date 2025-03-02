package com.backend.app.dto;

public class PatentCoInventorDTO {
	private Long id;
	private Long userId;
	private String userName;
	
	public PatentCoInventorDTO() {
		
	}

	public PatentCoInventorDTO(Long id, Long userId, String userName) {
		super();
		this.id = id;
		this.userId = userId;
		this.userName = userName;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}
	
	
}
