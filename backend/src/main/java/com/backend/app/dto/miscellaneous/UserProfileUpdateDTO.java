package com.backend.app.dto.miscellaneous;

import java.time.LocalDate;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileUpdateDTO {
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
	private LocalDate dateOfBirth;
	
	@JsonProperty("userType")
	private String userType;
	
	@JsonProperty("universityGroup")
	private String universityGroup;
	
	@JsonProperty("phoneNumber")
	private String phoneNumber;
	
	@JsonProperty("socialLinks")
	private Set<SocialLinkDTO> socialLinks;
	
	@Override
	public String toString() {
		 return String.format(
		            "UserProfileUpdateDTO{dateOfBirth=%s, userType='%s', universityGroup='%s', phoneNumber='%s'}",
		            dateOfBirth, userType, universityGroup, phoneNumber
		        );
	}
	
	
}
