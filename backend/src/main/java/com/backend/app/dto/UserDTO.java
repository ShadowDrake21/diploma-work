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
	
	private int publicationCount;
	
	private int patentCount;
	
	private int researchCount;
	
	private String affiliation;
	 
	public UserDTO() {}
	
	public UserDTO(Long id, String email, String username,
			Role role, String avatarUrl, LocalDate dateOfBirth, String userType,
			String universityGroup, String phoneNumber, int publicationCount, int patentCount, int researchCount, String affiliation) {
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
		this.publicationCount = publicationCount;
		this.patentCount = patentCount;
		this.researchCount = researchCount;
		this.affiliation = affiliation;
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

	public int getPublicationCount() {
		return publicationCount;
	}

	public void setPublicationCount(int publicationCount) {
		this.publicationCount = publicationCount;
	}

	public int getPatentCount() {
		return patentCount;
	}

	public void setPatentCount(int patentCount) {
		this.patentCount = patentCount;
	}

	public int getResearchCount() {
		return researchCount;
	}

	public void setResearchCount(int researchCount) {
		this.researchCount = researchCount;
	}

	public String getAffiliation() {
		return affiliation;
	}

	public void setAffiliation(String affiliation) {
		this.affiliation = affiliation;
	}
	
	
}
