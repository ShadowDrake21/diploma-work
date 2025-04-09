package com.backend.app.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

public class UserProfileUpdateDTO {
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
	private LocalDate dateOfBirth;
	
	@JsonProperty("userType")
	private String userType;
	
	@JsonProperty("universityGroup")
	private String universityGroup;
	
	@JsonProperty("phoneNumber")
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

	@Override
	public String toString() {
		 return String.format(
		            "UserProfileUpdateDTO{dateOfBirth=%s, userType='%s', universityGroup='%s', phoneNumber='%s'}",
		            dateOfBirth, userType, universityGroup, phoneNumber
		        );
	}
	
	
}
