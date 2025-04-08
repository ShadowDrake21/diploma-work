package com.backend.app.dto;

import java.time.LocalDate;

import com.backend.app.enums.Role;

public class UserDTO {	

	private Long id;	
	
	private String email;
	
	private String username;
	
	private Role role;
	
	private String avatarUrl;
	
	private LocalDate dateOfBirth;
	 
	private String userType;
	 
	private String universityGroup;
	
	private String phoneNumber;
	 
	public UserDTO() {}
	
	public UserDTO(Long id, String email, String username,
			Role role, String avatarUrl, LocalDate dateOfBirth, String userType,
			String universityGroup, String phoneNumber) {
		super();
		this.id = id;
		this.email = email;
		this.username = username;
		this.role = role;
		this.avatarUrl = avatarUrl;
		this.dateOfBirth = dateOfBirth;
		this.userType = userType;
		this.universityGroup = universityGroup;
		this.phoneNumber = phoneNumber;
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

	public LocalDate getDateOfBirth() {
		return dateOfBirth;
	}

	public void setDateOfBirth(LocalDate dateOfBirth) {
		this.dateOfBirth = dateOfBirth;
	}

	public String getUserType() {
		return userType;
	}

	public void setUserType(String userType) {
		this.userType = userType;
	}

	public String getUniversityGroup() {
		return universityGroup;
	}

	public void setUniversityGroup(String universityGroup) {
		this.universityGroup = universityGroup;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}
	
	
}
