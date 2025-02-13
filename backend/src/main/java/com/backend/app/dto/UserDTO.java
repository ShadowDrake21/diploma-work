package com.backend.app.dto;

import com.backend.app.enums.Role;

public class UserDTO {	
    public UserDTO() {}

	public UserDTO(Long id, String email, Role role) {
		super();
		this.id = id;
		this.email = email;
		this.role = role;
	}
	
	private Long id;	
	
	private String email;
	private Role role;
	
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

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

}
