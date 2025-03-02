package com.backend.app.dto;

import com.backend.app.enums.Role;

public class UserDTO {	
    public UserDTO() {}

	private Long id;	
	
	private String email;
	
	private String username;
	
	private Role role;
	
	public UserDTO(Long id, String email, String username, Role role) {
		super();
		this.id = id;
		this.email = email;
		this.username = username;
		this.role = role;
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

}
