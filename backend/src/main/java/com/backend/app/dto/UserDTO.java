package com.backend.app.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.backend.app.enums.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {	
	@Null(message = "ID should not be provided when creating a new user")
    @Positive(message = "ID must be a positive number")
    private Long id;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 255, message = "Email cannot exceed 255 characters")
    private String email;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotNull(message = "Role is required")
    private Role role;

    @Size(max = 512, message = "Avatar URL cannot exceed 512 characters")
    private String avatarUrl;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @Size(max = 50, message = "User type cannot exceed 50 characters")
    private String userType;

    @Size(max = 50, message = "University group cannot exceed 50 characters")
    private String universityGroup;

    @Pattern(regexp = "^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$", 
             message = "Phone number must be valid")
    private String phoneNumber;

    @Min(value = 0, message = "Publication count cannot be negative")
    private int publicationCount;

    @Min(value = 0, message = "Patent count cannot be negative")
    private int patentCount;

    @Min(value = 0, message = "Research count cannot be negative")
    private int researchCount;

    @Size(max = 255, message = "Affiliation cannot exceed 255 characters")
    private String affiliation;
    
    private LocalDateTime lastActive;
    
    private List<String> tags;
    
    private boolean active;
    
    private LocalDateTime createdAt;
}
