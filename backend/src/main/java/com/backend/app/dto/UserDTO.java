package com.backend.app.dto;

import com.backend.app.enums.Role;

public class UserDTO {	
    public UserDTO() {}

	private Long id;	
	
	private String email;
	
	private String username;
	
	private Role role;
	
	private String avatarUrl;
	
	public UserDTO(Long id, String email, String username, Role role, String avatarUrl) {
		super();
		this.id = id;
		this.email = email;
		this.username = username;
		this.role = role;
		this.avatarUrl = avatarUrl;
	}
	
	public Long getId() {
		return id;
	}
	
	public void setId(Long id) {
		this.id = id;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public String getAvatarUrl() {
		return avatarUrl;
	}

	public void setAvatarUrl(String avatarUrl) {
		this.avatarUrl = avatarUrl;
	}
}
