package com.backend.app.dto;

import java.time.LocalDate;

public class UserProfileUpdateDTO {
	private LocalDate dateOfBirth;
	private String userType;
	private String universityGroup;
	private String phoneNumber;
	
	public UserProfileUpdateDTO() {}
	
	public UserProfileUpdateDTO(LocalDate dateOfBirth, String userType, String universityGroup, String phoneNumber) {
		super();
		this.dateOfBirth = dateOfBirth;
		this.userType = userType;
		this.universityGroup = universityGroup;
		this.phoneNumber = phoneNumber;
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
